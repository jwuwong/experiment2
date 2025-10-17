// Define which clips are short and long
const SHORT_CLIPS = [
  // Male speakers - clips 01 and 02 are short
  'M1_01', 'M1_02', 'M2_01', 'M2_02', 'M3_01', 'M3_02', 'M4_01', 'M4_02', 'M5_01', 'M5_02',
  // Female speakers - clips 01 and 02 are short  
  'F1_01', 'F1_02', 'F2_01', 'F2_02', 'F3_01', 'F3_02', 'F4_01', 'F4_02', 'F5_01', 'F5_02'
];
const LONG_CLIPS = [
  // Male speakers - clips 03 and 04 are long
  'M1_03', 'M1_04', 'M2_03', 'M2_04', 'M3_03', 'M3_04', 'M4_03', 'M4_04', 'M5_03', 'M5_04',
  // Female speakers - clips 03 and 04 are long
  'F1_03', 'F1_04', 'F2_03', 'F2_04', 'F3_03', 'F3_04', 'F4_03', 'F4_04', 'F5_03', 'F5_04'
];

const NUM_PRACTICE = 3;


let audio_data = {
    ID: 'UNKNOWN', 
    talker: 'UNKNOWN',
    gender: 'UNKNOWN',
    order: 0, // 1 or 2
    duration: 0,
    speech_rate: 0,
    transcript: 'UNKNOWN',
}

let audio_temp = {
    stimulus: 'UNKNOWN',
    type: jsPsychAudioKeyboardResponse,
    prompt: 'UNKNOWN',
    trial_ends_after_audio: false,
    trial_duration: 0,
    post_trial_gap: 0,
    response_allowed_while_playing: false,
    choices: [],
    data: {}
}

// what to put here?
let response_data = {
}

let response_temp = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'UNKNOWN',
    choices: ['s', 'l'],
    data: {}
}

// Function to extract all audio file paths for preloading
function createPreloadArray(blocks) {
    let preload_exp = [];
    
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
        const currentBlock = blocks[blockIndex];
        
        // Go through each trial in the block (every 2 items: audio1, audio2)
        for (let trialIndex = 0; trialIndex < currentBlock.length; trialIndex += 2) {
            const firstAudio = currentBlock[trialIndex];
            const secondAudio = currentBlock[trialIndex + 1];
            
            // Add the stimulus paths to preload array
            if (firstAudio.stimulus && !preload_exp.includes(firstAudio.stimulus)) {
                preload_exp.push(firstAudio.stimulus);
            }
            if (secondAudio.stimulus && !preload_exp.includes(secondAudio.stimulus)) {
                preload_exp.push(secondAudio.stimulus);
            }
        }
    }
    
    return preload_exp;
}


let practice_trial_audio_objects = [];
let practice_trial_response_objects = [];
generateBlankTrials(NUM_PRACTICE, practice_trial_audio_objects, practice_trial_response_objects, audio_temp, response_temp, audio_data, response_data);
generatePracticeTrials(practice_trial_audio_objects, practice_trial_response_objects);


function makeCounterbalancedBlocks(stimuliData, num_trials_per_block, audio_template, response_template, audio_data_template, response_data_template) {
    // Get counterbalance ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const counterbalanceID = parseInt(urlParams.get('counterbalance')) || 1;
    
    // Determine block order based on counterbalance ID
    let firstBlockType, secondBlockType, firstClipSet, secondClipSet;
    
    if (counterbalanceID % 2 === 1) {
        // Odd IDs: Short first, then Long
        firstBlockType = 'short';
        secondBlockType = 'long';
        firstClipSet = SHORT_CLIPS;
        secondClipSet = LONG_CLIPS;
    } else {
        // Even IDs: Long first, then Short
        firstBlockType = 'long';
        secondBlockType = 'short';
        firstClipSet = LONG_CLIPS;
        secondClipSet = SHORT_CLIPS;
    }
    
    let all_blocks = [];
    
    // Generate 3 blocks of first type
    for (let blockNum = 0; blockNum < 3; blockNum++) {
        let trial_ord = [];
        let audio_trials = [];
        let response_trials = [];
        
        // Generate blank trials
        generateBlankTrials(num_trials_per_block, audio_trials, response_trials, 
                          audio_template, response_template, audio_data_template, response_data_template);
        
        // Generate trial order using first clip set
        generateTrialOrderFromClipSet(trial_ord, stimuliData, firstClipSet, num_trials_per_block);
        
        // Fill in the trials
        generateTrials(trial_ord, audio_trials, response_trials);
        
        // Add block type information to response data (now in second audio trial)
        for (let i = 0; i < audio_trials.length; i++) {
            audio_trials[i][1].data.block_type = firstBlockType;
            audio_trials[i][1].data.block_number = blockNum + 1;
            audio_trials[i][1].data.counterbalance_id = counterbalanceID;
        }
        
        // Combine audio trials into block format (no separate response trials)
        let block = [];
        for (let i = 0; i < num_trials_per_block; i++) {
            block.push(audio_trials[i][0]); // first audio
            block.push(audio_trials[i][1]); // second audio (with response)
        }
        
        all_blocks.push(block);
    }
    
    // Generate 3 blocks of second type
    for (let blockNum = 0; blockNum < 3; blockNum++) {
        let trial_ord = [];
        let audio_trials = [];
        let response_trials = [];
        
        // Generate blank trials
        generateBlankTrials(num_trials_per_block, audio_trials, response_trials, 
                          audio_template, response_template, audio_data_template, response_data_template);
        
        // Generate trial order using second clip set
        generateTrialOrderFromClipSet(trial_ord, stimuliData, secondClipSet, num_trials_per_block);
        
        // Fill in the trials
        generateTrials(trial_ord, audio_trials, response_trials);
        
        // Add block type information to response data (now in second audio trial)
        for (let i = 0; i < audio_trials.length; i++) {
            audio_trials[i][1].data.block_type = secondBlockType;
            audio_trials[i][1].data.block_number = blockNum + 4; // blocks 4, 5, 6
            audio_trials[i][1].data.counterbalance_id = counterbalanceID;
        }
        
        // Combine audio trials into block format (no separate response trials)
        let block = [];
        for (let i = 0; i < num_trials_per_block; i++) {
            block.push(audio_trials[i][0]); // first audio
            block.push(audio_trials[i][1]); // second audio (with response)
        }
        
        all_blocks.push(block);
    }
    
    return all_blocks;
}