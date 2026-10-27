/**
 * Données de démonstration (V1).
 * Les structures reprennent le modèle de données du cahier des charges (section V)
 * afin de pouvoir brancher l'API Django REST Framework sans changer les composants.
 */

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()
const iso = (offsetDays, hour = 23, min = 59) => {
  const d = new Date(now + offsetDays * DAY)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

export const EMAIL_DOMAIN = 'uta.ci'

export const filieres = [
  { id: 1, code: 'IGL', nom: 'Informatique et Génie Logiciel', description: 'Développement logiciel, bases de données, réseaux et systèmes.', is_active: true },
  { id: 2, code: 'RIT', nom: 'Réseaux Informatiques et Télécoms', description: 'Infrastructure réseau, télécommunications et sécurité.', is_active: false },
]

export const users = [
  { id: 1, nom: 'Tapé', prenom: 'Boudou Désiré', email: 'admin@uta.ci', password: 'demo1234', role: 'admin', filiere: 1, niveau: null, is_active: true, is_approved: true, date_joined: iso(-120) },
  { id: 2, nom: 'Kouassi', prenom: 'Jean-Marc', email: 'prof@uta.ci', password: 'demo1234', role: 'professeur', filiere: 1, niveau: null, is_active: true, is_approved: true, date_joined: iso(-90) },
  { id: 3, nom: 'Diabaté', prenom: 'Aminata', email: 'a.diabate@uta.ci', password: 'demo1234', role: 'professeur', filiere: 1, niveau: null, is_active: true, is_approved: true, date_joined: iso(-88) },
  { id: 4, nom: 'Yao', prenom: 'Serge', email: 's.yao@uta.ci', password: 'demo1234', role: 'professeur', filiere: 1, niveau: null, is_active: true, is_approved: false, date_joined: iso(-2) },
  { id: 5, nom: 'Koné', prenom: 'Mariam', email: 'etudiant@uta.ci', password: 'demo1234', role: 'etudiant', filiere: 1, niveau: 'L2', is_active: true, is_approved: true, date_joined: iso(-60) },
  { id: 6, nom: 'Bamba', prenom: 'Ismaël', email: 'i.bamba@uta.ci', password: 'demo1234', role: 'etudiant', filiere: 1, niveau: 'L2', is_active: true, is_approved: true, date_joined: iso(-58) },
  { id: 7, nom: "N'Guessan", prenom: 'Grâce', email: 'g.nguessan@uta.ci', password: 'demo1234', role: 'etudiant', filiere: 1, niveau: 'L2', is_active: true, is_approved: true, date_joined: iso(-55) },
  { id: 8, nom: 'Ouattara', prenom: 'Karim', email: 'k.ouattara@uta.ci', password: 'demo1234', role: 'etudiant', filiere: 1, niveau: 'L1', is_active: true, is_approved: true, date_joined: iso(-30) },
]

export const modules = [
  { id: 1, code: 'IGL201', nom: 'Programmation orientée objet', filiere: 1, niveau: 'L2', semestre: 'S3', professeurs: [2], couleur: '#1E7B34', is_active: true },
  { id: 2, code: 'IGL202', nom: 'Bases de données relationnelles', filiere: 1, niveau: 'L2', semestre: 'S3', professeurs: [3], couleur: '#5B2A86', is_active: true },
  { id: 3, code: 'IGL203', nom: 'Algorithmique avancée', filiere: 1, niveau: 'L2', semestre: 'S3', professeurs: [2], couleur: '#3FAE5A', is_active: true },
  { id: 4, code: 'IGL204', nom: 'Développement Web', filiere: 1, niveau: 'L2', semestre: 'S4', professeurs: [3, 2], couleur: '#166029', is_active: true },
  { id: 5, code: 'IGL205', nom: 'Réseaux informatiques', filiere: 1, niveau: 'L2', semestre: 'S4', professeurs: [], couleur: '#5B2A86', is_active: true },
  { id: 6, code: 'IGL101', nom: 'Introduction à la programmation', filiere: 1, niveau: 'L1', semestre: 'S1', professeurs: [2], couleur: '#1E7B34', is_active: true },
]

const f = (name, size) => ({ name, size })

export const resources = [
  { id: 1, titre: 'Chapitre 1 — Classes et objets', description: 'Notions de classe, instance, encapsulation. Exemples en Java.', type: 'cours', module: 1, auteur: 2, fichier: f('POO_chap1_classes.pdf', 2_450_000), created_at: iso(-21, 9, 10), date_limite: null },
  { id: 2, titre: 'Chapitre 2 — Héritage et polymorphisme', description: 'Héritage simple, classes abstraites, interfaces.', type: 'cours', module: 1, auteur: 2, fichier: f('POO_chap2_heritage.pptx', 5_820_000), created_at: iso(-12, 10, 0), date_limite: null },
  { id: 3, titre: 'TP 2 — Gestion de bibliothèque', description: 'Modéliser et implémenter une petite application de gestion de bibliothèque. Rendu : archive .zip du projet.', type: 'devoir', module: 1, auteur: 2, fichier: f('TP2_bibliotheque.pdf', 380_000), created_at: iso(-5, 14, 0), date_limite: iso(3) },
  { id: 4, titre: 'Introduction au modèle relationnel', description: 'Tables, clés primaires et étrangères, normalisation.', type: 'cours', module: 2, auteur: 3, fichier: f('BDD_intro_relationnel.pdf', 3_100_000), created_at: iso(-18, 8, 30), date_limite: null },
  { id: 5, titre: 'Vidéo — Les jointures SQL expliquées', description: 'Enregistrement de la séance du jeudi.', type: 'cours', module: 2, auteur: 3, fichier: f('seance_jointures.mp4', 148_000_000), created_at: iso(-7, 16, 0), date_limite: null },
  { id: 6, titre: 'Devoir — Requêtes SQL sur la base Scolarité', description: '15 requêtes à écrire. Rendre un fichier .sql commenté.', type: 'devoir', module: 2, auteur: 3, fichier: f('devoir_sql_scolarite.docx', 120_000), created_at: iso(-3, 11, 0), date_limite: iso(1, 18, 0) },
  { id: 7, titre: 'Examen partiel — Bases de données', description: 'Durée : 2h. Documents non autorisés. Salle B12.', type: 'examen', module: 2, auteur: 3, fichier: f('partiel_bdd_consignes.pdf', 90_000), created_at: iso(-2, 9, 0), date_limite: iso(9, 8, 0) },
  { id: 8, titre: 'Complexité et notation O', description: 'Analyse de complexité, cas moyen et pire cas.', type: 'cours', module: 3, auteur: 2, fichier: f('algo_complexite.pdf', 1_700_000), created_at: iso(-15, 9, 0), date_limite: null },
  { id: 9, titre: 'Exercices — Tris et recherche', description: 'Implémenter tri fusion et tri rapide, comparer les temps.', type: 'devoir', module: 3, auteur: 2, fichier: f('exos_tris.pdf', 210_000), created_at: iso(-10, 9, 0), date_limite: iso(-2) },
  { id: 10, titre: 'HTML & CSS — Les fondamentaux', description: 'Structure sémantique, flexbox, grid.', type: 'cours', module: 4, auteur: 3, fichier: f('web_html_css.pdf', 4_200_000), created_at: iso(-9, 10, 0), date_limite: null },
  { id: 11, titre: 'Mini-projet — Portfolio responsive', description: 'Réaliser un portfolio personnel responsive. Lien GitHub + archive.', type: 'devoir', module: 4, auteur: 3, fichier: f('miniprojet_portfolio.pdf', 260_000), created_at: iso(-1, 15, 0), date_limite: iso(12) },
  { id: 12, titre: 'Examen final — Algorithmique', description: 'Examen écrit, 3h. Calculatrice autorisée.', type: 'examen', module: 3, auteur: 2, fichier: f('examen_algo_infos.pdf', 75_000), created_at: iso(-1, 8, 0), date_limite: iso(20, 8, 0) },
]

export const submissions = [
  { id: 1, resource: 9, etudiant: 5, fichier: f('Kone_Mariam_tris.zip', 820_000), commentaire: 'Tri rapide avec pivot médian.', submitted_at: iso(-3, 20, 12) },
  { id: 2, resource: 9, etudiant: 6, fichier: f('bamba_tris.zip', 640_000), commentaire: '', submitted_at: iso(-1, 9, 40) },
  { id: 3, resource: 3, etudiant: 6, fichier: f('TP2_Bamba.zip', 1_200_000), commentaire: 'Version avec interface console.', submitted_at: iso(-1, 22, 5) },
  { id: 4, resource: 6, etudiant: 7, fichier: f('requetes_nguessan.sql', 14_000), commentaire: '', submitted_at: iso(0, 8, 30) },
]

export const downloads = [
  { id: 1, resource: 1, user: 5, at: iso(-20, 18, 0) },
  { id: 2, resource: 4, user: 5, at: iso(-17, 19, 30) },
  { id: 3, resource: 8, user: 5, at: iso(-14, 21, 0) },
]
