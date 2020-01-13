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

**Update 13/01/2020** : Désormais les Pods d’un même déploiement seront regroupés par un nœud commun. 
![alt text](https://i.ibb.co/8200ysB/kubernetes-graph.jpg)

## Installation
Prérequis :
- Node.js v13.4.0
- Npm v6.13.4

Le projet contient :
-	Un composant back-end écrit en Node.js afin de communiquer avec l’API Kubernetes
-	Un compensant front-end écrit en React qui communique avec le composant back-end

Actuellement les deux composants doivent être installés sur le serveur hébergeant Kubernetes. Une amélioration sera apportée pour surmonter cet obstacle et sécuriser la communication entre le composant back-end et l’API Kubernetes.


## TODO
- [ ] Filtrer les Pods par applications
- [ ] Ajouter un **autoscale** sur un déploiement avec un nombre min et max de Pod
- [ ] Pouvoir changer le type d'affichage pour regrouper les Pods par déploiement. Utile si nous avons un cluster avec des centaines d'applications

Si vous avez d'autres idées, n'hésitez pas à me les soumettre. 
