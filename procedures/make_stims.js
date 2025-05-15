const NUM_TRIALS = 20; // per block
const NUM_CLIPS = 40; // per block
const NUM_BLOCKS = 6;

const NUM_PRACTICE = 3;

const NUM_SPEAKERS = 10;
const NUM_CLIP_SPEAKER = 4;

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
    stimulus: '', // Initially blank
    trial_duration: 2000, // Limits overall trial length
    response_ends_trial: false, // Wait to manually end trial
    post_trial_gap: 0,
    data: {},
    on_load: function () {
        const listener = (e) => {
            if (e.key === 's' || e.key === 'l') {
                // Highlight
                if (e.key === 's') {
                    document.getElementById('clip1').classList.add('selected');
                } else if (e.key === 'l') {
                    document.getElementById('clip2').classList.add('selected');
                }

                // Remove listener so only one response counts
                document.removeEventListener('keydown', listener);

                // Record the response and delay trial end
                jsPsych.pluginAPI.setTimeout(() => {
                    jsPsych.finishTrial({
                        key_press: jsPsych.pluginAPI.convertKeyCharacterToKeyCode(e.key)
                    });
                }, 300); // 300ms delay for visual feedback
            }
        };

        document.addEventListener('keydown', listener);
    }
}
  
  

// Create random test orders
// let practice_trial_order = generateTrialOrder(practice_id_list, talker_ids);
// do this for each block!!! how to keep track......

let all_trial_audio_objects = [];
let all_trial_response_objects = [];

for (let i = 0; i < NUM_BLOCKS; i++){
    let exp_trial_order = [];
    generateTrialOrder(exp_trial_order, stimuliData, NUM_CLIPS, NUM_TRIALS);
    // generate the trial objects
    let exp_audio_objects = [];
    let exp_response_objects = [];
    generateBlankTrials(NUM_TRIALS, exp_audio_objects, exp_response_objects, audio_temp, response_temp, audio_data, response_data);
    generateTrials(exp_trial_order, exp_audio_objects, exp_response_objects);
    
    all_trial_audio_objects.push(...exp_audio_objects);
    all_trial_response_objects.push(...exp_response_objects);
}

// Create preload array
let preload_exp = [];

// preload clips from one block (since its the same clips)
for (let i = 0; i < NUM_TRIALS; i++) {
    preload_exp.push(all_trial_audio_objects[i][0].stimulus);
    preload_exp.push(all_trial_audio_objects[i][1].stimulus);
}

let practice_trial_audio_objects = [];
let practice_trial_response_objects = [];
generateBlankTrials(NUM_PRACTICE, practice_trial_audio_objects, practice_trial_response_objects, audio_temp, response_temp, audio_data, response_data);
generatePracticeTrials(practice_trial_audio_objects, practice_trial_response_objects);