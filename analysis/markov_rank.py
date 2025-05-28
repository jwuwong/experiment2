import pandas
import numpy as np
import json
from collections import defaultdict

# load data
f = open('./stimuliData.JSON')
data = json.load(f)

stimuliIDs = {}
id_arr = []

for i, stim in enumerate(data):
    stimuliIDs[stim['Clip ID']] = i
    id_arr.append(stim['Clip ID'])
num_clips = len(stimuliIDs)

df = pandas.read_csv('./data/final_data.csv')
df = df.drop(columns=["proliferate.condition",
             "question_order", "accuracy"])  # clean up data
df_trials = df[(df["trial_index"] >= 16) & (
    df["trial_index"] <= 375)]  # only take trial data

# build transition matrices
transition_mx = np.zeros((num_clips, num_clips))
cur_trial = []
for row in df_trials.itertuples(index=False):
    response, order = row.response, row.order
    # if its an audio object
    if order == 1 or order == 2:
        cur_trial.append(stimuliIDs[row.ID])
        continue
    if response == 's':
        transition_mx[cur_trial[1]][cur_trial[0]] += 1
    if response == "l":
        transition_mx[cur_trial[0]][cur_trial[1]] += 1
    cur_trial = []

# normalize for probabilities
row_sums = transition_mx.sum(axis=1, keepdims=True)
prob_matrix = transition_mx / row_sums

# apply markov process
# option 1: simulate until convergence
# option 2: find equilibrium
def equilibrium_distribution(p_transition):
    """This implementation comes from Colin Carroll, who kindly reviewed the notebook"""
    n_states = p_transition.shape[0]
    A = np.append(
        arr=p_transition.T - np.eye(n_states),
        values=np.ones(n_states).reshape(1, -1),
        axis=0
    )
    # Moore-Penrose pseudoinverse = (A^TA)^{-1}A^T
    pinv = np.linalg.pinv(A)
    # Return last row
    return pinv.T[-1]

stationary_prob = equilibrium_distribution(prob_matrix)

# output rankings - write to csv? 
clip_ranks = {}
order = stationary_prob.argsort()
for idx, i in enumerate(order):
    clip_ranks[id_arr[i]] = [idx+1, stationary_prob[i]]
rankings = pandas.DataFrame.from_dict(clip_ranks, orient='index', columns=["rank", "score"])
rankings.to_csv('./rankings.csv')