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
    stimulus: function() {
        return `
            <center>
                <div id="clip1" class="visual">Clip 1<p>Press "S"</p></div>
                <div id="clip2" class="visual">Clip 2<p>Press "L"</p></div>
            </center>
            <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;
    },
    trial_duration: 2000,  // Ends the trial automatically at 2s if no response
    response_ends_trial: false,  // We'll control trial ending ourselves
    post_trial_gap: 1000,
    data: {},

    on_start: function(trial) {
        let responded = false;

        const keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: function(info) {
                if (responded) return;  // Prevent multiple responses
                responded = true;

                const key = info.key;

                // Highlight selected clip
                if (key === 's') {
                    document.getElementById('clip1').classList.add('selected');
                } else if (key === 'l') {
                    document.getElementById('clip2').classList.add('selected');
                }

                // Record the response manually
                jsPsych.data.get().addToLast({
                    response: key,
                    rt: info.rt
                });

                // Wait 300ms to show feedback, then end trial
                jsPsych.pluginAPI.setTimeout(function() {
                    jsPsych.finishTrial();
                }, 300);
            },
            valid_responses: ['s', 'l'],
            rt_method: 'performance',
            persist: false,
            allow_held_key: false
        });

        // Also cancel key listening when trial ends naturally (after 2000ms)
        trial.on_load = function() {
            jsPsych.pluginAPI.setTimeout(function() {
                if (!responded) {
                    jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                }
            }, 2000);
        };
    },

    on_finish: function(data) {
        const response = data.response;
        data.selected_clip = response === 's' ? 1 : response === 'l' ? 2 : null;

        if (response === null) {
            consecutive_no_responses++;
            checkNoResponseTermination();
        } else {
            consecutive_no_responses = 0;
        }
    }
};


  

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