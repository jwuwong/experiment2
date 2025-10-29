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

// Template for FIRST audio clip - no responses allowed
let audio_temp_first = {
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

// Template for SECOND audio clip - responses allowed
let audio_temp_second = {
    stimulus: 'UNKNOWN',
    type: jsPsychAudioKeyboardResponse,
    prompt: 'UNKNOWN',
    trial_ends_after_audio: false,
    trial_duration: 0,
    post_trial_gap: 0,
    response_allowed_while_playing: true,
    choices: ['s', 'l'],
    data: {}
}
// Response data includes information about both clips for the trial pair
let response_data = {
    clip1_id: 'UNKNOWN',
    clip2_id: 'UNKNOWN',
    clip1_speaker: 'UNKNOWN',
    clip2_speaker: 'UNKNOWN',
    clip1_gender: 'UNKNOWN',
    clip2_gender: 'UNKNOWN',
    clip1_transcript: 'UNKNOWN',
    clip2_transcript: 'UNKNOWN',
    trial_type: 'UNKNOWN'
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
    response_ends_trial: true,  // Changed from false
    post_trial_gap: 500,
    data: {},

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

function generateTrialOrderFromClipSet(trial_ord, stimuliData, clipSet, num_trials) {
    let filteredStimuli = stimuliData.filter(clip => {
        return clipSet.includes(clip['Clip ID']);
    });
    
    let clip_indices = createArray(filteredStimuli.length);
    shuffle(clip_indices);
    
    for (let i = 0; i < num_trials; i++) {
        let idx1 = clip_indices.pop();
        let idx2 = clip_indices.pop();
        
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

//modified for two different audio
function generateBlankTrials(num_trials, audio_array, response_array, audio_template_first, audio_template_second, response_template, audio_data_template, response_data_template) {
    for (let i = 0; i < num_trials; i++) {
        // for audio; two clips with different templates
        let trial_copy = []
        
        // First audio - no responses
        let audio_copy_first = {
            type: audio_template_first.type  // Copy type directly
        };
        for (let key in audio_template_first) {
            if (key !== 'type' && key !== 'data') {  // Skip type and data
                audio_copy_first[key] = audio_template_first[key];
            }
        }
        let audio_data_copy_first = {};
        for (let key in audio_data_template) {
            audio_data_copy_first[key] = audio_data_template[key];
        }
        audio_copy_first.data = audio_data_copy_first;
        trial_copy.push(audio_copy_first);
        
        // Second audio - responses allowed
        let audio_copy_second = {
            type: audio_template_second.type  // Copy type directly
        };
        for (let key in audio_template_second) {
            if (key !== 'type' && key !== 'data') {  // Skip type and data
                audio_copy_second[key] = audio_template_second[key];
            }
        }
        let audio_data_copy_second = {};
        for (let key in audio_data_template) {
            audio_data_copy_second[key] = audio_data_template[key];
        }
        audio_copy_second.data = audio_data_copy_second;
        trial_copy.push(audio_copy_second);
        
        audio_array.push(trial_copy);

        // for response
        let response_copy = {
            type: response_template.type  // Copy type directly
        };
        for (let key in response_template) {
            if (key !== 'type' && key !== 'data') {  // Skip type and data
                response_copy[key] = response_template[key];
            }
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


function generatePracticeTrials(audio_trials, response_trials) {
    let firstPrompt = `
        <center>
                <div id="clip1" class="visual-play">Clip 1<p>Press "S"</p></div>
                <div id="clip2" class="visual">Clip 2<p>Press "L"</p></div>
        </center>
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;

    let secondPrompt = `
        <center>
                <div id="clip1" class="visual">Clip 1<p>Press "S"</p></div>
                <div id="clip2" class="visual-play">Clip 2<p>Press "L"</p></div>
        </center>
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;

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
        
        firstAudio.data.ID = 'practice_trial' + trial_num + '_clip1';
        firstAudio.data.talker = 'practice_speaker';
        firstAudio.data.gender = 'unknown';
        firstAudio.data.order = 1;
        firstAudio.data.duration = 4;
        firstAudio.data.speech_rate = 'unknown';
        firstAudio.data.transcript = 'practice_transcript';

        // Second practice audio (response allowed by template)
        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;  // Just shows which clip is playing
        secondAudio.trial_duration = 4000;
        
        secondAudio.data.ID = 'practice_trial' + trial_num + '_clip2';
        secondAudio.data.talker = 'practice_speaker';
        secondAudio.data.gender = 'unknown';
        secondAudio.data.order = 2;
        secondAudio.data.duration = 4;
        secondAudio.data.speech_rate = 'unknown';
        secondAudio.data.transcript = 'practice_transcript';

        response.data.clip1_id = 'practice_trial' + trial_num + '_clip1';
        response.data.clip2_id = 'practice_trial' + trial_num + '_clip2';
        response.data.trial_type = 'practice';
    }
}

function generateTrials(trial_ord, audio_trials, response_trials) {
    let firstPrompt = `
        <center>
                <div id="clip1" class="visual-play">Clip 1<p>Press "S"</p></div>
                <div id="clip2" class="visual">Clip 2<p>Press "L"</p></div>
        </center>
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;

    let secondPrompt = `
        <center>
                <div id="clip1" class="visual">Clip 1<p>Press "S"</p></div>
                <div id="clip2" class="visual-play">Clip 2<p>Press "L"</p></div>
        </center>
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;

    for (let i = 0; i < trial_ord.length; i++) {
        let [firstClip, secondClip] = trial_ord[i];
        let [firstAudio, secondAudio] = audio_trials[i];
        let response = response_trials[i];

        let firstAudioPath = '../audio/' + firstClip['Clip ID'] + '.WAV';
        let secondAudioPath = '../audio/' + secondClip['Clip ID'] + '.WAV';

        // First audio clip
        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.trial_duration = parseFloat(firstClip['Duration (s)']) * 1000 + 500;
        
        firstAudio.data.ID = firstClip['Clip ID'];
        firstAudio.data.talker = firstClip['Speaker ID'];
        firstAudio.data.gender = firstClip['Gender'];
        firstAudio.data.order = 1;
        firstAudio.data.duration = firstClip['Duration (s)'];
        firstAudio.data.speech_rate = firstClip['Speech rate (words per s)'];
        firstAudio.data.transcript = firstClip['Transcription'];

        // Second audio clip (response allowed by template)
        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;  // Just shows which clip is playing
        secondAudio.trial_duration = parseFloat(secondClip['Duration (s)']) * 1000;
        
        secondAudio.data.ID = secondClip['Clip ID'];
        secondAudio.data.talker = secondClip['Speaker ID'];
        secondAudio.data.gender = secondClip['Gender'];
        secondAudio.data.order = 2;
        secondAudio.data.duration = secondClip['Duration (s)'];
        secondAudio.data.speech_rate = secondClip['Speech rate (words per s)'];
        secondAudio.data.transcript = secondClip['Transcription'];

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

function makeCounterbalancedBlocks(stimuliData, num_trials_per_block, audio_template_first, audio_template_second, response_template, audio_data_template, response_data_template) {
    let all_blocks = [];
    
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
        
        generateBlankTrials(num_trials_per_block, audio_trials, response_trials, 
                          audio_template_first, audio_template_second, response_template, 
                          audio_data_template, response_data_template);
        
        generateTrialOrderFromClipSet(trial_ord, stimuliData, firstClipSet, num_trials_per_block);
        generateTrials(trial_ord, audio_trials, response_trials);
        
        for (let i = 0; i < response_trials.length; i++) {
            response_trials[i].data.block_type = firstBlockType;
            response_trials[i].data.block_number = blockNum + 1;
            response_trials[i].data.counterbalance_id = counterbalanceID;
        }
        
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
        
        generateBlankTrials(num_trials_per_block, audio_trials, response_trials, 
                          audio_template_first, audio_template_second, response_template,
                          audio_data_template, response_data_template);
        
        generateTrialOrderFromClipSet(trial_ord, stimuliData, secondClipSet, num_trials_per_block);
        generateTrials(trial_ord, audio_trials, response_trials);
        
        for (let i = 0; i < response_trials.length; i++) {
            response_trials[i].data.block_type = secondBlockType;
            response_trials[i].data.block_number = blockNum + 4;
            response_trials[i].data.counterbalance_id = counterbalanceID;
        }
        
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

// Fixed to handle 3 items per trial (audio1, audio2, response)
function createPreloadArray(blocks) {
    let preload_exp = [];
    
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
        const currentBlock = blocks[blockIndex];
        
        // Go through each trial in the block (every 3 items: audio1, audio2, response)
        for (let trialIndex = 0; trialIndex < currentBlock.length; trialIndex += 3) {
            const firstAudio = currentBlock[trialIndex];
            const secondAudio = currentBlock[trialIndex + 1];
            // const response = currentBlock[trialIndex + 2]; // doesn't have audio
            
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
generateBlankTrials(NUM_PRACTICE, practice_trial_audio_objects, practice_trial_response_objects, 
                    audio_temp_first, audio_temp_second, response_temp, audio_data, response_data);
generatePracticeTrials(practice_trial_audio_objects, practice_trial_response_objects);