### Run with:
###   python map_parser.py filename
### where filename is the name of the image file to parse.
### Use > operator to write output to file.

import sys
import numpy as np
import scipy.ndimage
import matplotlib.pyplot as plt

#kmeans algorithm
def kmeans(data,k):
    n,N = data.shape

    losses = []

    eps = 1e-6
    centroids,labels = init_centroids(data,k)

    while True:
        labels = partition_data(data,centroids)
        centroids = update_centroids(data, labels, k, centroids)
        losses.append(loss(data,centroids,labels))
        if len(losses) >= 2 and abs(losses[-1] - losses[-2]) <= eps:
            break

    return centroids, labels, losses

def init_centroids(data,k):
    centroids = np.zeros((n,k))
    labels = np.zeros(N)

    return centroids,labels

def partition_data(data,centroids):
    N = data.shape[1]
    labels = np.zeros(N,dtype=int)
    for i in range(N):
        distances = np.apply_along_axis(lambda x: np.linalg.norm(x-data[:,i]),0,centroids)
        labels[i] = np.argmin(distances)
    return labels


def update_centroids(data, labels, k, old_centroids):
    n = data.shape[0]
    centroids = np.zeros((n,k))

    for j in range(k):
        points = data[:,labels==j]
        if points.size == 0:
            centroids[:,j] = old_centroids[:,j]
        else:
            centroids[:,j] = points.mean(axis=1)
    return centroids

def loss(data, centroids, labels):
    N = data.shape[1]
    s = 0.0
    for i in range(N):
        s += np.linalg.norm(data[:,i] - centroids[:,labels[i]])**2
    return s/N

def init_centroids(data, k):
    n,N = data.shape
    labels = np.random.randint(0,k,size=N)
    centroids = update_centroids(data, labels, k, np.zeros((n,k)))

    return centroids, labels



filename = sys.argv[1]

full_map = scipy.ndimage.imread(filename)

squares = []

N = 26 # number of columns/rows
M = 8 # pixel width/height for each square

# split full map into 26x26 squares, each 8x8 pixels large
for i in range(N):
    for j in range(N):
        squares.append(full_map[i*M:i*M+M,j*M:j*M+M,:])

# lists to store kmeans results for each square:
a_c = []
a_l = []
a_J = []

# run kmeans (is 3 times total enough?) for each square
for j in range(676):
    c,l,J = kmeans(squares[j].transpose(2,0,1).reshape(3,-1),1)
    for i in range (2):
        c_temp,l_temp,J_temp = kmeans(squares[j].transpose(2,0,1).reshape(3,-1),1)
        if (J_temp < J):
            c,l,J = c_temp,l_temp,J_temp  
    a_c.append(c)
    a_l.append(l)
    a_J.append(J)

# test values for stage 01:   
#print("Nothing")
#print(a_c[0])
#print("Brick")
#print(a_c[26 + 26 + 2])
#print("Steel")
#print(a_c[6*26 + 12])
#print("statue top left")
#print(a_c[24*N + 12])
#print("statue top right")
#print(a_c[24*N + 13])
#print("statue bottom left")
#print(a_c[25*N + 12])
#print("statue bottom right")
#print(a_c[25*N + 13])
# test values for stage 02:   
#print("Trees")
#print(a_c[8*N])
# test values for stage 04:   
#print("Water")
#print(a_c[10*N])
# test values for stage 17:   
#print("Ice")
#print(a_c[6*N])

## Nothing ~ 0,0,0
## Statue top left ~ 70,67,65
## Statue top right ~ 71,66,64
## Statue bottom left ~ 52,50,50
## Statue bottom right ~ 52,50,50
## Water ~ 97,110,242
## Trees ~ 97,157,20
## Brick ~ 160,99,43
## Steel ~ 184,184,184
## Ice ~ 190,190,190

# convert rgb values to terrain value
# 0: brick
# 1: steel
# 2: water
# 3: tree
# 4: ice
# 5: blank

terrain = []

for c in a_c:
    # just use first value to decide
    # maybe needs others too?
    if c[0][0] < 80: #nothing + statue
        terrain.append(5)
    elif c[0][0] < 110 and c[1][0] < 130: #water
        terrain.append(2)
    elif c[0][0] < 110: #trees
        terrain.append(3)
    elif c[0][0] < 180: #brick
        terrain.append(0)
    elif c[0][0] < 188: #steel
        terrain.append(1)
    else: #ice
        terrain.append(4)
        
# quick and dirty code to print results in desired format
res = []
print("[")
for i in range(N):
    if i < 25: # do we want comma at the end?
        print(" [" + ','.join(str(i) for i in terrain[i*N:i*N+N]) + "],")
    else:
        print(" [" + ','.join(str(i) for i in terrain[i*N:i*N+N]) + "]")
print("]")





  
