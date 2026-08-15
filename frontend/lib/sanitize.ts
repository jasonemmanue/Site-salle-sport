import DOMPurify from 'isomorphic-dompurify';

/**
 * Le contenu des articles est du HTML produit par le RichEditor de l'admin
 * (contentEditable → innerHTML). Il est donc injecte via dangerouslySetInnerHTML,
 * ce qui en fait une surface XSS stockee : un compte admin compromis, ou un
 * copier-coller depuis une page piegee, suffirait a injecter du script.
 *
 * On desinfecte donc systematiquement avant affichage, avec une liste blanche
 * limitee a ce que la barre d'outils du RichEditor sait produire.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'blockquote', 'a', 'span', 'div',
];

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel'];

// Note : `img` est volontairement absent. La barre d'outils du RichEditor ne
// permet pas d'inserer d'image dans le corps d'un article (seule la couverture
// est televersee, via un champ dedie). Si l'editeur gagne un bouton image, il
// faudra ajouter 'img' aux balises et 'src'/'alt' aux attributs — la balise
// serait sinon silencieusement supprimee a l'affichage.

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Coupe court aux URL `javascript:` et consorts dans les liens.
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
  });
}
