"""Recopie d'une reservation dans le formulaire Google de la salle.

La salle tenait son registre dans un formulaire Google : date, nom, type de
seance, formule de paiement, montant, coach, remarque. Notre systeme de
reservation ne demandait qu'une partie de ces informations. Il les demande
maintenant toutes, et **recopie chaque reservation dans ce formulaire** : la
feuille de reponses continue de se remplir comme avant, sans que personne n'ait
a ressaisir quoi que ce soit.

Le formulaire n'est jamais montre au visiteur — c'est notre propre formulaire
de reservation qu'il remplit. La recopie se fait de serveur a serveur.

L'envoi se fait sur `.../formResponse`, le point d'entree qu'utilise la page du
formulaire elle-meme. Les identifiants `entry.NNNN` ci-dessous ont ete releves
dans le `FB_PUBLIC_LOAD_DATA_` de la page publique.

⚠️ **La date part en une seule valeur `AAAA-MM-JJ`.** La recette officieuse qui
circule decrit un triplet `entry.NNNN_year` / `_month` / `_day` : ce formulaire
le **refuse** par un 400. Verifie sur le formulaire reel.

⚠️ **Les intitules des choix doivent etre exacts, accents compris.** Envoyer
« Seance » au lieu de « Séance » suffit a faire rejeter tout l'envoi.

⚠️ Rien ici n'est une API publique : Google peut changer ce point d'entree sans
prevenir. C'est pourquoi un echec n'annule jamais la reservation — il est
seulement note sur la ligne, et le back-office propose de le rejouer.
"""

import urllib.error
import urllib.parse
import urllib.request
from datetime import date

from app.core.config import settings

CHAMPS = {
    "session_date": "entry.1859557394",
    "full_name": "entry.1963678662",
    "session_type": "entry.1062618537",
    "payment_type": "entry.1243048007",
    "amount_paid": "entry.1438213460",
    "coach_name": "entry.1231872317",
    "feedback": "entry.1797340128",
}

TYPES_DE_SEANCE = ("Individuel", "Collectif")
TYPES_DE_PAIEMENT = (
    "Abonnée mensuel",
    "Séance",
    "Abonnement de karaté",
    "Abonnement de box",
)


class EnvoiGoogleEchoue(Exception):
    """La recopie vers le formulaire n'a pas abouti."""


def url_du_formulaire() -> str:
    return f"https://docs.google.com/forms/d/e/{settings.GOOGLE_FORM_ID}/viewform"


def _url_d_envoi() -> str:
    return f"https://docs.google.com/forms/d/e/{settings.GOOGLE_FORM_ID}/formResponse"


def _nom_du_coach(enrollment) -> str | None:
    slot = getattr(enrollment, "slot", None)
    coach = getattr(slot, "coach", None) if slot else None
    return getattr(coach, "name", None)


def raison_de_ne_pas_recopier(enrollment) -> str | None:
    """Dit pourquoi une reservation ne peut pas etre recopiee, ou None.

    Le formulaire rend obligatoires le type de seance, la formule de paiement et
    le nom du coach. Une reservation prise sans ces renseignements reste
    parfaitement valable chez nous — elle n'est simplement pas recopiable, et il
    vaut mieux le dire clairement que de collectionner des erreurs 400.
    """
    if not enrollment.session_type:
        return "Type de seance non renseigne"
    if not enrollment.payment_type:
        return "Formule de paiement non renseignee"
    if not _nom_du_coach(enrollment):
        return "Creneau sans coach"
    return None


def construire_charge(enrollment) -> dict[str, str]:
    """Traduit une reservation en parametres `entry.NNNN`.

    Les champs vides sont omis : Google accepte l'absence d'une question
    facultative, mais pas toujours une chaine vide.
    """
    valeurs = {
        "session_date": enrollment.specific_date.isoformat()
        if isinstance(enrollment.specific_date, date)
        else str(enrollment.specific_date),
        "full_name": enrollment.user_name,
        "session_type": enrollment.session_type,
        "payment_type": enrollment.payment_type,
        # Question de texte libre cote Google : le montant part en chaine, sans
        # separateur de milliers, pour rester exploitable dans la feuille.
        "amount_paid": None
        if enrollment.amount_paid is None
        else f"{int(round(float(enrollment.amount_paid)))}",
        "coach_name": _nom_du_coach(enrollment),
        "feedback": enrollment.feedback,
    }
    return {
        CHAMPS[cle]: str(valeur)
        for cle, valeur in valeurs.items()
        if valeur not in (None, "")
    }


def envoyer(enrollment) -> None:
    """Poste la reservation dans le formulaire. Leve `EnvoiGoogleEchoue` sinon."""
    if not settings.GOOGLE_FORM_ENABLED:
        raise EnvoiGoogleEchoue("Recopie vers Google desactivee (GOOGLE_FORM_ENABLED)")

    empechement = raison_de_ne_pas_recopier(enrollment)
    if empechement:
        raise EnvoiGoogleEchoue(empechement)

    corps = urllib.parse.urlencode(construire_charge(enrollment), encoding="utf-8").encode()
    requete = urllib.request.Request(
        _url_d_envoi(),
        data=corps,
        headers={"User-Agent": "EslieSport/1.0 (+site web)"},
    )
    try:
        with urllib.request.urlopen(requete, timeout=settings.GOOGLE_FORM_TIMEOUT) as reponse:
            if reponse.status != 200:
                raise EnvoiGoogleEchoue(f"Reponse inattendue de Google : {reponse.status}")
    except urllib.error.HTTPError as erreur:
        # 400 = une valeur refusee : intitule de choix errone, date mal formee,
        # ou question devenue obligatoire cote Google.
        raise EnvoiGoogleEchoue(f"Google a refuse l'envoi ({erreur.code})") from erreur
    except urllib.error.URLError as erreur:
        raise EnvoiGoogleEchoue(f"Google injoignable : {erreur.reason}") from erreur
    except OSError as erreur:  # delai depasse, coupure reseau
        raise EnvoiGoogleEchoue(f"Envoi interrompu : {erreur}") from erreur
