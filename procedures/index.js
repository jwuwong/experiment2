/* initialize jsPsych */
var jsPsych = initJsPsych({
  show_progress_bar: true,
  on_finish: function () {
    //jsPsych.data.displayData();
    window.location = "https://jwuwong.github.io/boston/procedures/thanks.html";
    proliferate.submit({ "trials": jsPsych.data.get().values() });
  },
  default_iti: 250
});

const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;
            
/* create timeline */
var timeline = [];

/* Add a counter variable to track consecutive no-responses */
var consecutive_no_responses = 0;
const MAX_CONSECUTIVE_NO_RESPONSES = 5;

/* Create a function to check if we should terminate the experiment */
function checkNoResponseTermination() {
  if (consecutive_no_responses >= MAX_CONSECUTIVE_NO_RESPONSES) {
    // End the experiment with a message
    jsPsych.endExperiment('The experiment has ended because you did not respond to multiple trials in a row.');
  }
}

const sounds = [ // These are just the practice trial sounds! REAL trial sounds are in the audio folder
  '../practice/trial1_clip1.WAV',
  '../practice/trial1_clip2.WAV',
  '../practice/trial2_clip1.WAV',
  '../practice/trial2_clip2.WAV',
  '../practice/trial3_clip1.WAV',
  '../practice/trial3_clip2.WAV'
];

/* Real trials */
// Create the counterbalanced blocks - UPDATED CALL (no response templates needed)
const blocks = generate6Blocks(
    stimuliData, 
    20, 
    audio_temp,        // your audio_temp
    audio_data         // your audio_data
);

// Create the preload array from the blocks
function createPreloadArray(blocks) {
    const preloadArray = [];
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
        const currentBlock = blocks[blockIndex];
        for (let trialIndex = 0; trialIndex < currentBlock.length; trialIndex++) {
            const trial = currentBlock[trialIndex];
            // Add both audio clips from the trial
            preloadArray.push(trial[0].stimulus);
            preloadArray.push(trial[1].stimulus);
        }
    }
    return preloadArray;
}

const preload_exp = createPreloadArray(blocks);

// Preloading files are needed to present the stimuli accurately.
const preload_practice = {
  type: jsPsychPreload,
  audio: sounds,
  max_load_time: 120000 // 2 minutes
}

var preload_trial = {
  type: jsPsychPreload,
  audio: preload_exp,
  max_load_time: 120000 // 2 minutes
}

timeline.push(preload_practice);
timeline.push(preload_trial);

/*
var stopCollection = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p>This study is currently not accepting new participants. Please check back again in the future.</p>',
    choices: "NO_KEYS",
};
timeline.push(stopCollection);
*/

// browser check
var browser_check = {
  type: jsPsychBrowserCheck,
  inclusion_function: (data) => {
    return data.browser == 'chrome' && data.mobile === false
  },
  exclusion_message: (data) => {
    if(data.mobile){
      return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>';
    } else if (data.browser !== 'chrome'){
      return '<p>You must use Chrome browser to complete this experiment.</p>'
    }
  }
};
timeline.push(browser_check);

/* Consent form trial */
var consent = {
  type: jsPsychExternalHtml,
  url: "consent.html",
  cont_btn: "consent-button",
  check_fn: function() {
    if (document.getElementById('consent_checkbox').checked) {
      return true;
    } else {
      alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
      return false;
    }
  }
};
timeline.push(consent);

/* Instructions trial */
var instructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <div class="text" id="trial">
          <p>Welcome to the experiment!</p>
          <p>In this task, you will listen to pairs of audio clips from different speakers.</p>
          <p>Your job is to decide which speaker sounds more like someone who was born in Boston.</p>
          <p>You will hear two clips in sequence. After hearing both clips, you will indicate your choice:</p>
          <ul style="text-align:left; margin-left:30%">
              <li>Press <strong>'S'</strong> if you think the first clip sounds more like a Boston native</li>
              <li>Press <strong>'L'</strong> if you think the second clip sounds more like a Boston native</li>
          </ul>
          <p>You can respond while the second clip is playing.</p>
          <p>There are no right or wrong answers - just go with your gut feeling!</p>
          <p>Let's start with a few practice trials.</p>
      </div>
    `,
  choices: ["Continue"],
  button_html: `<button class="submit-btn">%choice%</button>`
};
timeline.push(instructions);

/* Create inter-trial pause */
const interTrialPause = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: "NO_KEYS",
    trial_duration: 500,
};

/* Generate practice trials */
let practice_trial_audio_objects = [];
generatePracticeTrials(3, practice_trial_audio_objects, audio_temp, audio_data);

/* Practice trials - modified to include responses in second audio */
for (let i = 0; i < practice_trial_audio_objects.length; i++) {
    timeline.push(practice_trial_audio_objects[i][0]); // First clip (no response)
    timeline.push(practice_trial_audio_objects[i][1]); // Second clip (accepts responses)
    timeline.push(interTrialPause); // Pause after response
}

/* End of practice */
var end_practice = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <div class="text" id="trial">
          <p>Great job! You've completed the practice trials.</p>
          <p>Now we'll begin the main experiment.</p>
          <p>Remember:</p>
          <ul style="text-align:left; margin-left:30%">
              <li>Listen to both clips</li>
              <li>Press <strong>'S'</strong> for the first clip or <strong>'L'</strong> for the second clip</li>
              <li>You can respond while the second clip is playing</li>
              <li>Go with your first impression</li>
          </ul>
          <p>Click 'Begin' when you're ready to start.</p>
      </div>
    `,
  choices: ["Begin"],
  button_html: `<button class="submit-btn">%choice%</button>`
};
timeline.push(end_practice);

/* Real trials - modified to include responses in second audio */
for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    const currentBlock = blocks[blockIndex];
    
    // Add all trials from this block
    for (let trialIndex = 0; trialIndex < currentBlock.length; trialIndex++) {
        const trial = currentBlock[trialIndex]; // Each trial is [firstAudio, secondAudio]
        
        timeline.push(trial[0]); // First audio clip (no response)
        timeline.push(trial[1]); // Second audio clip (accepts responses)
        timeline.push(interTrialPause); // Pause after response
    }
    
    // Add a break after each block (except the last one)
    if (blockIndex < blocks.length - 1) {
        const block_break = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div class="text" id="trial">
                    <p>You've completed block ${blockIndex + 1} of ${blocks.length}.</p>
                    <p>Take a short break if you need one.</p>
                    <p>Click 'Continue' when you're ready to proceed.</p>
                </div>
            `,
            choices: ["Continue"],
            button_html: `<button class="submit-btn">%choice%</button>`
        };
        timeline.push(block_break);
    }
}

/* survey 1: demographic questions */
var survey1 = {
  type: jsPsychSurvey,
  pages: [
    [
      {
        type: 'html',
        prompt: `<p style="color: #000000">Please answer the following questions:</p>`,
      },
      {
        type: 'text',
        prompt: "What was your ZIP code when you were growing up (before the age of 14)?",
        name: 'zipcode_growing_up',
        required: true,
        input_type: 'text',
        placeholder: 'Enter 5-digit ZIP code',
        regex: /^[0-9]{5}$/,
        error_message: "Please enter a valid 5-digit ZIP code."
      },
      {
        type: 'text',
        prompt: "What was your ZIP code during most of your teenage years?",
        name: 'zipcode_teenage_years',
        required: true,
        input_type: 'text',
        placeholder: 'Enter 5-digit ZIP code',
        regex: /^[0-9]{5}$/,
        error_message: "Please enter a valid 5-digit ZIP code."
      },
      {
        type: 'text',
        prompt: "What was your ZIP code during most of your adult years?",
        name: 'zipcode_adult_years',
        required: true,
        input_type: 'text',
        placeholder: 'Enter 5-digit ZIP code',
        regex: /^[0-9]{5}$/,
        error_message: "Please enter a valid 5-digit ZIP code."
      },
      {
        type: 'text',
        prompt: "What is your current ZIP code?",
        name: 'current_zipcode',
        required: true,
        input_type: 'text',
        placeholder: 'Enter 5-digit ZIP code',
        regex: /^[0-9]{5}$/,
        error_message: "Please enter a valid 5-digit ZIP code."
      },
      {
        type: 'multi-choice',
        prompt: "What is your gender?",
        name: 'gender',
        options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'],
        required: true,
      },
      {
        type: 'text',
        prompt: "What is your age?",
        name: 'age',
        required: true,
        input_type: 'number'
      },
      {
        type: 'multi-choice',
        prompt: "What is your highest level of education?",
        name: 'education',
        options: [
          'Less than high school',
          'High school graduate',
          'Some college',
          'Associate degree',
          'Bachelor\'s degree',
          'Graduate degree',
          'Prefer not to say'
        ],
        required: true,
      }
    ]
  ],
  button_label_finish: 'Continue',
};
timeline.push(survey1);

/* future study? */
var futurestudies = {
  type: jsPsychSurvey,
  pages: [
    [
      {
        type: 'multi-choice',
        prompt: "Do you consent to being contacted for future studies?",
        name: 'futurestudies',
        options: ['Yes', 'No'],
        required: true,
      }
    ]
  ],
  button_label_finish: 'Continue',
};
timeline.push(futurestudies);

const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "Y3jdmRtKbrN7", // Your experiment ID
    filename: filename,
    data_string: ()=>jsPsych.data.get().csv()
};

timeline.push(save_data);

/* thank you */
const thankyou = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
        <div class="text" id="trial">
            <p>Thank you for completing the experiment!</p>
            <p>Here is the study link for completion: https://app.prolific.com/submissions/complete?cc=C10MFI6S</p>
            <p>Please click the "Submit" button to submit your responses and complete the study.</p>
        </div>
      `,
  choices: ["Submit"],
  button_html: `<button class="submit-btn">%choice%</button>`
};
timeline.push(thankyou);

/* start the experiment */
jsPsych.run(timeline);