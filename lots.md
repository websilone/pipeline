# Lots · Pipeline

Découpage de Pipeline en lots livrables. Un lot = un parcours utilisateur complet, de l'écran à la base.

## Lot 1 · Ajouter un contact

Je remplis un formulaire avec le nom, l'entreprise et l'email, puis je valide. Le contact apparaît aussitôt dans la colonne « À contacter », et il est enregistré dans SQLite.

- [ ] Étant donné le formulaire rempli avec un nom, quand je valide, alors le contact apparaît dans « À contacter ».
- [ ] Étant donné un formulaire sans nom, quand je valide, alors le contact n'est pas créé et un message d'erreur s'affiche sur le champ.
- [ ] Étant donné un email mal formé, quand je valide, alors le contact n'est pas créé et l'erreur est signalée.
- [ ] Étant donné un contact ajouté, quand je redémarre l'app en local, alors il est toujours là.

## Lot 2 · Faire avancer un contact dans le pipeline

Le tableau montre les 5 étapes en colonnes. Sur la carte d'un contact, je choisis une autre étape, et la carte passe dans la colonne correspondante.

- [ ] Étant donné un contact « À contacter », quand je le passe à « Contacté », alors il apparaît dans « Contacté » et plus dans « À contacter ».
- [ ] Étant donné un contact dans n'importe quelle étape, quand je choisis une étape, alors seules les 5 étapes fixes sont proposées.
- [ ] Étant donné une étape inconnue envoyée au serveur, quand le changement est traité, alors il est refusé et le contact garde son étape.
- [ ] Étant donné un changement d'étape, quand je recharge la page, alors le contact est toujours dans sa nouvelle étape.

## Lot 3 · Planifier la prochaine relance

J'entre une date de prochaine relance, soit à la création du contact, soit plus tard depuis sa carte. La date s'affiche sur la carte.

- [ ] Étant donné un contact, quand je lui donne une date de relance, alors cette date s'affiche sur sa carte.
- [ ] Étant donné un contact qui a déjà une date de relance, quand je la change, alors la nouvelle date remplace l'ancienne.
- [ ] Étant donné un contact dont la date est dépassée, quand j'affiche le tableau, alors sa carte est marquée « en retard » (token `text-overdue`).
- [ ] Étant donné une date de relance enregistrée, quand je recharge la page, alors elle est toujours là.

## Lot 4 · Voir qui relancer aujourd'hui

Une section « À relancer aujourd'hui » liste les contacts à relancer. J'y vois d'un coup d'œil qui appeler ou écrire aujourd'hui.

- [ ] Étant donné un contact « Contacté » dont la relance tombe aujourd'hui, quand j'ouvre l'app, alors il apparaît dans « À relancer aujourd'hui ».
- [ ] Étant donné un contact « En discussion » dont la relance est dépassée, quand j'ouvre l'app, alors il apparaît aussi dans la liste.
- [ ] Étant donné un contact « Gagné » ou « Perdu » dont la relance est dépassée, quand j'ouvre l'app, alors il n'apparaît pas.
- [ ] Étant donné un contact dont la relance tombe demain, ou qui n'a pas de date, quand j'ouvre l'app, alors il n'apparaît pas.
- [ ] Étant donné aucun contact à relancer, quand j'ouvre l'app, alors un état vide l'indique.

## Lot 5 · Modifier la fiche d'un contact et ses notes

J'ouvre la fiche d'un contact. Je corrige son nom, son entreprise ou son email, et j'ajoute ou modifie des notes libres sur l'échange.

- [ ] Étant donné un contact, quand j'ouvre sa fiche, alors je vois son nom, son entreprise, son email, ses notes, son étape et sa date de relance.
- [ ] Étant donné une fiche ouverte, quand je modifie les notes et que j'enregistre, alors les nouvelles notes sont conservées après rechargement.
- [ ] Étant donné une fiche ouverte, quand je vide le nom et que j'enregistre, alors la modification est refusée avec un message d'erreur.
- [ ] Étant donné une modification enregistrée, quand je reviens au tableau, alors la carte affiche les nouvelles valeurs.

## Lot 6 · Retrouver ses contacts en production

L'app est déployée sur Vercel et branchée sur Turso. Mes contacts survivent aux redéploiements, et le passage à Turso ne touche que la couche données.

- [ ] Étant donné des contacts créés en production, quand l'app est redéployée, alors ils sont toujours là.
- [ ] Étant donné les variables Turso renseignées, quand l'app démarre, alors elle utilise Turso, et sans ces variables elle utilise SQLite en local.
- [ ] Étant donné le passage à Turso, quand je regarde le diff, alors seuls `src/data/` et `.env.example` ont changé.
- [ ] Étant donné le dépôt, quand je lance les vérifications des règles de couches, alors aucune ne renvoie de résultat.

## Choix retenus

- Changement d'étape libre entre les 5 étapes fixes, retour en arrière compris.
- Date de relance facultative : sans date, un contact n'est jamais « à relancer ».
- Pas de suppression de contact (absente d'`INTENT.md`).
