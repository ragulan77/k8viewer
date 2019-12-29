# K8viewer
## Présentation
L'application K8viewer permet de visualiser un cluster Kubernetes sous forme de graph et d'effectuer les actions suivantes :
- zoomer / dezoomer le graph
- bouger les noeuds du graph
- afficher les détails d'un Pod
- supprimer un Pod
- changer le paramètre **replicas** d'un **déploiement** Kubernetes
- mettre à jour dynamiquement le graph en fonction des évènements (Création ou Suppression d'un Pod) envoyés par le serveur Kubernetes

## Démo
Voici une démonstration du projet : https://youtu.be/hn8hVXnPRzw

Sur cet exemple, il n'y a qu'un seul noeud Kubernetes, mais rien n'empêche d'en avoir plusieurs dans le cluster. 

## TODO
- [ ] Filtrer les Pods par applications
- [ ] Ajouter un **autoscale** sur un déploiement avec un nombre min et max de Pod
- [ ] Pouvoir changer le type d'affichage pour regrouper les Pods par déploiement. Utile si nous avons un cluster avec des centaines d'applications

Si vous avez d'autres idées, n'hésitez pas à me les soumettre. 
