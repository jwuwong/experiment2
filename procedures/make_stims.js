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
    choices: ['s', 'l'],
    stimulus: function() {
        return `
            <center>
                <div id="clip1" class="visual">Clip 1<p>Press "S"</p></div>
                <div id="clip2" class="visual">Clip 2<p>Press "L"</p></div>
            </center>
            <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;
    },
    trial_duration: 2000,
    response_ends_trial: false,
    post_trial_gap: 2000,
    data: {},

    on_start: function(trial) {
        jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: function(info) {
                let key = info.key;
                if (key === 's') {
                    document.getElementById('clip1').classList.add('selected');
                } else if (key === 'l') {
                    document.getElementById('clip2').classList.add('selected');
                }

                // Save response manually
                jsPsych.data.get().addToLast({response: key});
            },
            valid_responses: ['s', 'l'],
            rt_method: 'performance',
            persist: false,
            allow_held_key: false
        });
    },

    on_finish: function(data) {
        const response = data.response;
        if (response === 's') {
            data.selected_clip = 1;
        } else if (response === 'l') {
            data.selected_clip = 2;
        } else {
            data.selected_clip = null;
        }

        if (response === null) {
            consecutive_no_responses++;
            checkNoResponseTermination();
        } else {
            consecutive_no_responses = 0;
        }
    }
};

  



// Add a counterbalancing parameter to determine order
const counterbalanceID = Math.floor(Math.random() * 2); // 0 or 1
const shortFirst = counterbalanceID === 0; // true = short first, false = long first

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function createArray(num) {
    let arr = [];
    for (let i = 0; i < num; i++) {
        arr.push(i);
    }
    return arr;
}

// Modified to work with specific clip sets (short or long)
function generateTrialOrderFromClipSet(trial_ord, stimuliData, clipSet, num_trials) {
    // Filter stimuliData to only include clips from the specified set
    let filteredStimuli = stimuliData.filter(clip => {
        // Use the Clip ID directly (string matching)
        return clipSet.includes(clip['Clip ID']);
    });
    
    // Create array of indices for the filtered stimuli
    let clip_indices = createArray(filteredStimuli.length);
    shuffle(clip_indices);
    
    for (let i = 0; i < num_trials; i++) {
        let idx1 = clip_indices.pop();
        let idx2 = clip_indices.pop();
        
        // If we run out of clips, reshuffle and continue
        if (clip_indices.length < 2) {
            clip_indices = createArray(filteredStimuli.length);
            shuffle(clip_indices);
        }
        
        let clip1 = filteredStimuli[idx1];
        let clip2 = filteredStimuli[idx2];
        let trial = [clip1, clip2];
        trial_ord.push(trial);
    }
    
    return trial_ord;
}

// Original function for backward compatibility
function generateTrialOrder(trial_ord, stimuliData, num_clips, num_trials) {
    let clip_nums = createArray(num_clips);
    shuffle(clip_nums);
    
    for (let i = 0; i < num_trials; i++) {
        let clip1 = clip_nums.pop();
        let clip2 = clip_nums.pop();
        let trial = [stimuliData[clip1], stimuliData[clip2]];
        trial_ord.push(trial);
    }
    
    return trial_ord;
}

// create deep copy of audio templates to generate blank trials
function generateBlankTrials(num_trials, audio_array, response_array, audio_template, response_template, audio_data_template, response_data_template) {
    for (let i = 0; i < num_trials; i++) {
        // for audio; two clips
        let trial_copy = []
        for (let i = 0; i < 2; i++) {
            let audio_copy = {};
            for (let key in audio_template) {
                audio_copy[key] = audio_template[key];
            }
            let audio_data_copy = {};
            for (let key in audio_data_template) {
                audio_data_copy[key] = audio_data_template[key];
            }
            audio_copy.data = audio_data_copy;
            trial_copy.push(audio_copy);
        }
        audio_array.push(trial_copy);

        // for response
        let response_copy = {};
        for (let key in response_template) {
            response_copy[key] = response_template[key];
        }
        let response_data_copy = {};
        for (let key in response_data_template) {
            response_data_copy[key] = response_data_template[key];
        }
        response_data_copy.Order = i + 1;
        response_copy.data = response_data_copy;
        response_array.push(response_copy);
    }
}

// create trials for audio and response trials that are both arrays of empty templates
function generatePracticeTrials(audio_trials, response_trials) {
    let firstPrompt = `
        <center>
            <div id="clip1" class="visual-play">Clip 1</div>
            <div class="visual">Clip 2</div>
        </center>
        <p style="text-align:center">Listening to clips</p>`; // initial prompt for first clip

    let secondPrompt = `
        <center>
            <div class="visual">Clip 1</div>
            <div id="clip2" class="visual-play">Clip 2</div>
        </center>
        <p style="text-align:center">Listening to clips</p>`; // initial prompt for second clip

    for (let i = 0; i < audio_trials.length; i++) {
        let [firstAudio, secondAudio] = audio_trials[i];
        let response = response_trials[i];
        let trial_num = (i + 1).toString();
        let firstAudioPath = '../practice/' + 'trial' + trial_num + '_clip1' + '.WAV';
        let secondAudioPath = '../practice/' + 'trial' + trial_num + '_clip2' + '.WAV';

        // First practice audio
        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.trial_duration = 4000;
        
        // Capture practice data for first clip
        firstAudio.data.ID = 'practice_trial' + trial_num + '_clip1';
        firstAudio.data.talker = 'practice_speaker'; // or specific if you have it
        firstAudio.data.gender = 'unknown'; // or specific if you have it
        firstAudio.data.order = 1;
        firstAudio.data.duration = 4; // approximate since trial_duration is 4000ms
        firstAudio.data.speech_rate = 'unknown';
        firstAudio.data.transcript = 'practice_transcript'; // or specific if you have it

        // Second practice audio
        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;
        secondAudio.trial_duration = 4000;
        
        // Capture practice data for second clip
        secondAudio.data.ID = 'practice_trial' + trial_num + '_clip2';
        secondAudio.data.talker = 'practice_speaker'; // or specific if you have it
        secondAudio.data.gender = 'unknown'; // or specific if you have it
        secondAudio.data.order = 2;
        secondAudio.data.duration = 4; // approximate since trial_duration is 4000ms
        secondAudio.data.speech_rate = 'unknown';
        secondAudio.data.transcript = 'practice_transcript'; // or specific if you have it

        // Add practice trial information to response data
        response.data.clip1_id = 'practice_trial' + trial_num + '_clip1';
        response.data.clip2_id = 'practice_trial' + trial_num + '_clip2';
        response.data.trial_type = 'practice';
    }
}

function generateTrials(trial_ord, audio_trials, response_trials) {
    let firstPrompt = `
        <center>
            <div id="clip1" class="visual-play">Clip 1</div>
            <div class="visual">Clip 2</div>
        </center>
        <p style="text-align:center">Listening to clips</p>`; // initial prompt for first clip

    let secondPrompt = `
        <center>
            <div class="visual">Clip 1</div>
            <div id="clip2" class="visual-play">Clip 2</div>
        </center>
        <p style="text-align:center">Listening to clips</p>`; // initial prompt for second clip

    for (let i = 0; i < trial_ord.length; i++) {
        let [firstClip, secondClip] = trial_ord[i];
        let [firstAudio, secondAudio] = audio_trials[i]; // blank template to fill
        let response = response_trials[i]; // tbd

        let firstAudioPath = '../audio/' + firstClip['Clip ID'] + '.WAV';
        let secondAudioPath = '../audio/' + secondClip['Clip ID'] + '.WAV';

        // First audio clip
        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.trial_duration = parseFloat(firstClip['Duration (s)']) * 1000 + 500;
        
        // Capture first clip data
        firstAudio.data.ID = firstClip['Clip ID'];
        firstAudio.data.talker = firstClip['Speaker ID'];
        firstAudio.data.gender = firstClip['Gender'];
        firstAudio.data.order = 1;
        firstAudio.data.duration = firstClip['Duration (s)'];
        firstAudio.data.speech_rate = firstClip['Speech rate (words per s)'];
        firstAudio.data.transcript = firstClip['Transcription'];

        // Second audio clip
        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;
        secondAudio.trial_duration = parseFloat(secondClip['Duration (s)']) * 1000;
        
        // Capture second clip data
        secondAudio.data.ID = secondClip['Clip ID'];
        secondAudio.data.talker = secondClip['Speaker ID'];
        secondAudio.data.gender = secondClip['Gender'];
        secondAudio.data.order = 2;
        secondAudio.data.duration = secondClip['Duration (s)'];
        secondAudio.data.speech_rate = secondClip['Speech rate (words per s)'];
        secondAudio.data.transcript = secondClip['Transcription'];

        // Add trial pair information to response data
        response.data.clip1_id = firstClip['Clip ID'];
        response.data.clip2_id = secondClip['Clip ID'];
        response.data.clip1_speaker = firstClip['Speaker ID'];
        response.data.clip2_speaker = secondClip['Speaker ID'];
        response.data.clip1_gender = firstClip['Gender'];
        response.data.clip2_gender = secondClip['Gender'];
        response.data.clip1_transcript = firstClip['Transcription'];
        response.data.clip2_transcript = secondClip['Transcription'];
        response.data.trial_type = 'experimental';
    }
}

// New function to create counterbalanced blocks
function makeCounterbalancedBlocks(stimuliData, num_trials_per_block, audio_template, response_template, audio_data_template, response_data_template) {
    let all_blocks = [];
    
    // Determine order of blocks based on counterbalancing
    const firstClipSet = shortFirst ? SHORT_CLIPS : LONG_CLIPS;
    const secondClipSet = shortFirst ? LONG_CLIPS : SHORT_CLIPS;
    const firstBlockType = shortFirst ? 'short' : 'long';
    const secondBlockType = shortFirst ? 'long' : 'short';
    
    console.log(`Counterbalance ID: ${counterbalanceID}, Order: ${firstBlockType} first, then ${secondBlockType}`);
    
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
        
        // Add block type information to response data
        for (let i = 0; i < response_trials.length; i++) {
            response_trials[i].data.block_type = firstBlockType;
            response_trials[i].data.block_number = blockNum + 1;
            response_trials[i].data.counterbalance_id = counterbalanceID;
        }
        
        // Combine audio and response trials into block format
        let block = [];
        for (let i = 0; i < num_trials_per_block; i++) {
            block.push(audio_trials[i][0]); // first audio
            block.push(audio_trials[i][1]); // second audio
            block.push(response_trials[i]);  // response
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
        
        // Add block type information to response data
        for (let i = 0; i < response_trials.length; i++) {
            response_trials[i].data.block_type = secondBlockType;
            response_trials[i].data.block_number = blockNum + 4; // blocks 4, 5, 6
            response_trials[i].data.counterbalance_id = counterbalanceID;
        }
        
        // Combine audio and response trials into block format
        let block = [];
        for (let i = 0; i < num_trials_per_block; i++) {
            block.push(audio_trials[i][0]); // first audio
            block.push(audio_trials[i][1]); // second audio
            block.push(response_trials[i]);  // response
        }
        
        all_blocks.push(block);
    }
    
    return all_blocks;
}

// Function to extract all audio file paths for preloading
function createPreloadArray(blocks) {
    let preload_exp = [];
    
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
        const currentBlock = blocks[blockIndex];
        
        // Go through each trial in the block (every 3 items: audio1, audio2, response)
        for (let trialIndex = 0; trialIndex < currentBlock.length; trialIndex += 3) {
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