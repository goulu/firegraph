#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
populate firebase from GraphViz .dot/.gv file(s)
"""
__author__ = "Philippe Guglielmetti"
__copyright__ = "Copyright 2015, Philippe Guglielmetti"
__license__ = "LGPL"

import os.path, logging

from firebase import firebase
from pygraphviz import AGraph

DSN = 'https://brilliant-heat-1116.firebaseio.com/Graph/'

EMAIL = 'yourfirebase@email.here'
SECRET = 'YourFirebaseSecretHere' #DO NOT PUBLISH !!!

authentication = firebase.FirebaseAuthentication(SECRET,EMAIL, True, True)
    
ref = firebase.FirebaseApplication(DSN, authentication=authentication)
    
def graphviz_to_firebase(dirname,filename):
    """
    since several chars must be escaped from firebase keys,
    (see #http://stackoverflow.com/questions/19132867/adding-firebase-data-dots-and-forward-slashes
    we can't directly use them as keys so:
    - we use integer i as key,
    - "nodes" dict maps node name to i to preserve edges coherency
    - node name is kept as default node label
    """
    f=os.path.join(dirname, filename)
    graph=filename.split('.')[0]
    print('processing %s'%f),
    agraph=AGraph(f)
    nodes={}
    for i,node in enumerate(agraph.iternodes()):
        nodes[node]=i
        attrs={}
        attrs.update(agraph.node_attr)
        attrs['label']=node #default label is node id
        attrs.update(node.attr)
        key='%s/%d'%(graph,i)
        ref.patch(key,attrs)
        print('.'),
    for j,edge in enumerate(agraph.iteredges()):
        attrs={}
        attrs.update(agraph.edge_attr)
        attrs.update(edge.attr)
        attrs['source']=nodes[edge[0]]
        i=nodes[edge[1]]
        attrs['target']=i
        #edges are added as attributes of their destination node
        key='%s/%d/edge/%d'%(graph,i,j)
        ref.patch(key,attrs)
        print('-'),
    logging.info('ok')
    
    
def step(extensions, dirname, names):
    for name in names:
        if name.split('.')[-1].lower() in extensions:
            graphviz_to_firebase(dirname,name)

            
#process all graphviz files in a directory + subdirs
dir = 'C:/Program Files (x86)/Graphviz/share/graphviz/graphs/directed'

graphviz_to_firebase(dir,'crazy.gv')
exit()

os.path.walk(dir, step, '.dot.gv')