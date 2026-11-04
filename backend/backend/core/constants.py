"""Constantes métier partagées (mêmes valeurs que le frontend)."""

ROLE_ETUDIANT = "etudiant"
ROLE_PROFESSEUR = "professeur"
ROLE_ADMIN = "admin"
ROLE_CHOICES = [
    (ROLE_ETUDIANT, "Étudiant"),
    (ROLE_PROFESSEUR, "Professeur"),
    (ROLE_ADMIN, "Administrateur"),
]

NIVEAU_CHOICES = [("L1", "L1"), ("L2", "L2"), ("L3", "L3")]
SEMESTRE_CHOICES = [(f"S{i}", f"S{i}") for i in range(1, 7)]

TYPE_COURS = "cours"
TYPE_DEVOIR = "devoir"
TYPE_EXAMEN = "examen"
TYPE_CHOICES = [
    (TYPE_COURS, "Cours"),
    (TYPE_DEVOIR, "Devoir"),
    (TYPE_EXAMEN, "Examen"),
]
