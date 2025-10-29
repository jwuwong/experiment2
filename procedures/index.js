/* Initialize jsPsych */
var jsPsych = initJsPsych({
  on_finish: function() {
    proliferate.submit({"trials": jsPsych.data.get().values()});
  }
});

/* Create timeline */
var timeline = [];

const sounds = [ // These are just the practice trial sounds! REAL trial sounds are in the audio folder
  '../practice/trial1_clip1.wav',
  '../practice/trial1_clip2.wav',
  '../practice/trial2_clip1.wav',
  '../practice/trial2_clip2.wav',
  '../practice/trial3_clip1.wav',
  '../practice/trial3_clip2.wav'
];



/* Real trials */
// Create the counterbalanced blocks
const blocks = makeCounterbalancedBlocks(
    stimuliData, 
    20, 
    audio_temp,        // your audio_temp
    response_temp,     // your response_temp  
    audio_data,        // your audio_data
    response_data      // your response_data
);



// Create the preload array from the blocks
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
      return data.browser === 'chrome' && data.mobile === false
    },
    exclusion_message: (data) => {
      if(data.mobile){
        return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>';
      } else if (data.browser !== 'chrome'){
        return '<p>You must use Chrome to complete this experiment.</p>'
      }
    }
  };
timeline.push(browser_check);





var instructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
        <div class="text" id="instruction" >
            <img src="../images/stanford_logo.png" alt="stanford logo" width="180" height="80">
            <p><b>Only complete this study if you are a Massachussets resident who is 18 years old or older.</b></p>
            <p>Please share this link with other people you know who live in the area, but <u>do not participate in this study more than once</u>.
            <BR>You will not be compensated more than once.</p> 
            <p>In this experiment, you will be listening to pairs of audio clips.</p>
            <p>Each pair of audio clips will be played once in consecutive order. Your task is to decide which one of the clips sounds like the speaker was born in Boston.</p>
            <p>Please ensure that you use earphones or headphones for the duration of this experiment.</p>
            <p>This experiment should be completed on a <b><u>desktop or laptop</u></b> using the <b><u>Google Chrome browser</u></b>.</p>
            <p>The experiment will take approximately 20 minutes. You will be compensated as advertised on Prolific for your time.</p>
        </div>
      `,
  choices: ["Continue"],
  button_html: `<button class="continue-btn">%choice%</button>`,
};
timeline.push(instructions);

/* define welcome message trial */
var legalinfo = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `<p><strong>Thank you for your participation in this study. Please read the protocol below.</strong></p>
        <p>Protocol Director: Robert Hawkins</P
        <p>Protocol Title: Communication and social cognition in natural audiovisual contexts IRB# 77226</p>
        <p>DESCRIPTION: You are invited to participate in a research study about language and communication. 
        The purpose of the research is to understand how you interact and communicate with other people in naturalistic settings as a fluent English speaker. 
        This research will be conducted through the Prolific platform, including participants from the US, UK, and Canada. 
        If you decide to participate in this research, you will play a communication game in a group with one or more partners.</p>
        <p>TIME INVOLVEMENT: The task will last the amount of time advertised on Prolific. You are free to withdraw from the study at any time.</p>
        <p>RISKS AND BENEFITS: You may become frustrated if your partner gets distracted, or experience discomfort if other participants in your group 
        send text that is inappropriate for the task. We ask you to please be respectful of other participants you might be
        interacting with to mitigate these risks. You may also experience discomfort when being asked to discuss or challenge emotionally salient political beliefs. Study data will be
        stored securely, in compliance with Stanford University standards, minimizing the risk of confidentiality breach. This study advances our scientific understanding of how people
        communication and collaborate in naturalistic settings. This study may lead to further
        insights about what can go wrong in teamwork, suggest potential interventions to
        overcome these barriers, and help to develop assistive technologies that collaborate with
        human partners. We cannot and do not guarantee or promise that you will receive any benefits from this study.</p>
        <p>PAYMENTS: You will receive payment in the amount advertised on Prolific. If you do not complete this study, you will receive prorated payment based on the time that you have
        spent. Additionally, you may be eligible for bonus payments as described in the instructions.</p>
        <p> PARTICIPANTS RIGHTS: If you have read this form and have decided to participate in this project, please understand your participation is voluntary and you have the right
        to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. The alternative
        is not to participate. You have the right to refuse to answer particular questions. The results of this research study may be presented at scientific or professional meetings or
        published in scientific journals. Your individual privacy will be maintained in all published and written data resulting from the study. In accordance with scientific norms, the data
        from this study may be used or shared with other researchers for future research (after removing personally identifying information) without additional consent from you.</p>
        <p>CONTACT INFORMATION: Questions: If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact the Protocol Director, Robert Hawkins (rdhawkins@stanford.edu, 217-549-6923).</p>
        <p>Independent Contact: If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to
        speak to someone independent of the research team at 650-723-2480 or toll free at 1-866-680-2906, or email at irbnonmed@stanford.edu. You can also write to the Stanford IRB, Stanford University, 1705 El Camino Real, Palo Alto, CA 94306. Please save or print a
        copy of this page for your records.</p>
        <p>If you agree to participate in this research, press the <strong>CONTINUE</strong> button to begin.</p> 
      `,
  choices: ["Continue"],
  button_html: `<button class="continue-btn">%choice%</button>`,
};
timeline.push(legalinfo);

/* sound check 
Put one of the deleted processed audio clips and have them type in the last word in the clip.
*/
const soundcheck = {
  type: jsPsychCloze,
  text: `<center><BR><BR><audio controls src="../soundcheck.wav"></audio></center><BR><BR>Listen carefully to the audio clip above. Type the <b>last word</b> that was said into the blank below and press "Continue".<BR><BR>% friends %`,
  check_answers: true,
  case_sensitivity: false,
  button_text: 'Check',
  mistake_fn: function () { alert("Wrong answer. Please make sure your audio is working properly and try again. Make sure you're using lowercase") }
};
timeline.push(soundcheck);

/* Practice trial instructions */
var practiceinstructions_page1 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <center>   
      <div class="instruction-box">   
        <p>In this experiment, you'll listen to short audio clips of people speaking and make quick judgments.</p>
        <p>We'll start with 3 practice trials so you can get familiar with the task.</p>
        <p>In each trial, two audio clips will play one after another. You will hear a variety of sentences and phrases spoken by different talkers.</p>
        <p>Each audio clip will only be played once and you will not be able to replay them.</p>
        <p><strong>Your task is to decide which clip sounds more like someone who was born in Boston.</strong></p>
    </center>
        `,
    choices: ["Continue"],
    button_html: `<button class="continue-btn">%choice%</button>`,
};

var practiceinstructions_page2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <center>   
      <div class="instruction-box">   
        <p>Please place your left index finger on the "S" key and your right index finger on the "L" key.</p>
        <p><img src="../procedures/keyboard.png" width="500" style="margin-top:-10px"></p>
        <p>If the <strong>first clip</strong> sounds more like someone who was born in Boston, please <strong>press S</strong>.</p>
        <p>If the <strong>second clip</strong> sounds more like someone who was born in Boston, please <strong>press L</strong>.</p>
        <p><b>You can respond as soon as the second clip starts playing, or wait until it finishes.</b></p>
        <p>This is a timed task. If you do not respond in time, the next question will appear automatically.</p>
        <p><b>Please answer as quickly and accurately as possible.</b></p>
    </center>
        `,
    choices: ["Continue"],
    button_html: `<button class="continue-btn">%choice%</button>`,
};

timeline.push(practiceinstructions_page1);
timeline.push(practiceinstructions_page2);

// Add inter-trial interval
var inter_trial_interval = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: 500  // 500ms pause between trials
};

/* Practice trials */
for (let i = 0; i < practice_trial_audio_objects.length; i++) {
    // Add on_finish handler to second audio (where response happens)
    practice_trial_audio_objects[i][1].on_finish = function(data) {
        const response = data.response;
        if (response === 's') {
            data.selected_clip = 1;
        } else if (response === 'l') {
            data.selected_clip = 2;
        } else {
            data.selected_clip = null;
        }
    };
    
    timeline.push(practice_trial_audio_objects[i][0]);  // First audio (no response)
    timeline.push(practice_trial_audio_objects[i][1]);  // Second audio (with response)
    timeline.push(inter_trial_interval);  // Pause
}


/* REAL trial instructions */
var realinstructions_page1 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <center>
      <div class="instruction-box">
        <p>You will now begin the experiment.</p>
        <p>In each trial, two audio clips will play one after another. You will hear a variety of sentences and phrases spoken by different talkers.</p>
        <p>Each audio clip will only be played once and you will not be able to replay them.</p>
        <p><strong>Your task is to decide which clip sounds more like someone who was born in Boston.</strong></p>
        <p><strong>These clips come from a range of different people so they might not all sound like your typical Bostonian, but please do your best to respond as quickly as possible.</strong></p>
    </center>
        `,
    choices: ["Continue"],
    button_html: `<button class="continue-btn">%choice%</button>`,
};

var realinstructions_page2 = {
    type: jsPsychHtmlButtonResponse ,
    stimulus: `
    <center>   
      <div class="instruction-box">   
        <p>Please place your left index finger on the "S" key and your right index finger on the "L" key.</p>
        <p><img src="../procedures/keyboard.png" width="500" style="margin-top:-10px"></p>
        <p>If the <strong>first clip</strong> sounds more like someone who was born in Boston, please <strong>press S</strong>.</p>
        <p>If the <strong>second clip</strong> sounds more like someone who was born in Boston, please <strong>press L</strong>.</p>
        <p><b>You can respond as soon as the second clip starts playing, or wait until it finishes.</b></p>
        <p>This is a timed task. If you do not respond in time, the next question will appear automatically.</p>
        <p><b>Please answer as quickly and accurately as possible.</b></p>
    </center>
        `,
    choices: ["Continue"],
    button_html: `<button class="continue-btn">%choice%</button>`,
};

timeline.push(realinstructions_page1);
timeline.push(realinstructions_page2);


// Track consecutive no-responses
let consecutive_no_responses = 0;
const MAX_NO_RESPONSES = 5;

function checkNoResponseTermination() {
    if (consecutive_no_responses >= MAX_NO_RESPONSES) {
        jsPsych.endExperiment('<p>The experiment has ended because you did not respond to multiple trials in a row. Thank you for your time.</p>');
    }
}

function handleTrialResponse(data) {
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

// Add trials to timeline
for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    const currentBlock = blocks[blockIndex];
    
    // Add block break before blocks 2-6
    if (blockIndex > 0) {
        const block_break = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
            <center>
              <div class="instruction-box">
                <p>You've completed block ${blockIndex} of 6.</p>
                <p>Feel free to take a short break.</p>
                <p>Click Continue when you're ready to proceed.</p>
              </div>
            </center>
            `,
            choices: ["Continue"],
            button_html: `<button class="continue-btn">%choice%</button>`,
        };
        timeline.push(block_break);
    }
    
    // Add all trials in the block
    for (let trialIndex = 0; trialIndex < currentBlock.length; trialIndex += 2) {
        const firstAudio = currentBlock[trialIndex];
        const secondAudio = currentBlock[trialIndex + 1];
        
        // Add on_finish handler to second audio trial
        secondAudio.on_finish = handleTrialResponse;
        
        timeline.push(firstAudio);   // First audio (no response)
        timeline.push(secondAudio);  // Second audio (with response)
        timeline.push(inter_trial_interval);  // Pause
    }
}


/* Demographics survey */
var survey = {
  type: jsPsychSurvey,
  pages: [
    [
      {
        type: 'html',
        prompt: "<p>Please answer the following questions about yourself.</p>"
      },
      {
        type: 'multi-choice',
        prompt: "What is your age range?", 
        name: 'age', 
        options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
        required: true
      },
      {
        type: 'multi-choice',
        prompt: "What is your gender?", 
        name: 'gender', 
        options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Prefer to self-describe'],
        required: true
      },
      {
        type: 'text',
        prompt: "If you selected 'Prefer to self-describe', please specify:",
        name: 'gender_self_describe',
        required: false
      }
    ],
    [
      {
        type: 'multi-choice',
        prompt: "What is your native language (the first language you learned as a child)?",
        name: 'native_language',
        options: ['English', 'Spanish', 'Mandarin', 'Other'],
        required: true
      },
      {
        type: 'text',
        prompt: "If you selected 'Other', please specify:",
        name: 'native_language_other',
        required: false
      },
      {
        type: 'multi-choice',
        prompt: "Do you speak any other languages fluently?",
        name: 'other_languages',
        options: ['Yes', 'No'],
        required: true
      },
      {
        type: 'text',
        prompt: "If yes, please list them:",
        name: 'other_languages_list',
        required: false
      }
    ],
    [
      {
        type: 'text',
        prompt: "Where were you born? (City, State/Province, Country)",
        name: 'birthplace',
        required: true
      },
      {
        type: 'text',
        prompt: "Where did you grow up (ages 0-18)? If multiple places, please list all:",
        name: 'grew_up',
        required: true
      },
      {
        type: 'text',
        prompt: "Where do you currently live? (City, State/Province, Country)",
        name: 'current_location',
        required: true
      }
    ],
    [
      {
        type: 'multi-choice',
        prompt: "Have you ever lived in the Boston area?",
        name: 'lived_in_boston',
        options: ['Yes', 'No'],
        required: true
      },
      {
        type: 'text',
        prompt: "If yes, for how long?",
        name: 'boston_duration',
        required: false
      },
      {
        type: 'multi-choice',
        prompt: "How familiar are you with the Boston accent?",
        name: 'boston_familiarity',
        options: ['Very familiar', 'Somewhat familiar', 'Not very familiar', 'Not at all familiar'],
        required: true
      }
    ],
    [
      {
        type: 'drop-down',
        prompt: "What is the highest level of education you have completed?",
        name: 'education',
        options: [
          'Less than high school',
          'High school diploma or equivalent',
          'Some college',
          'Associate degree',
          'Bachelor\'s degree',
          'Master\'s degree',
          'Doctoral degree',
          'Professional degree (MD, JD, etc.)'
        ],
        required: true
      },
      {
        type: 'text',
        prompt: "Do you have any comments about the experiment?",
        name: 'comments',
        required: false
      }
    ]
  ],
  button_label_finish: 'Submit'
};

timeline.push(survey);

/* Debrief */
var debrief = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <center>
      <div class="instruction-box">
        <p>Thank you for participating in our study!</p>
        <p>Your responses have been recorded.</p>
        <p>Click 'Finish' to complete the experiment and return to Prolific.</p>
      </div>
    </center>
    `,
    choices: ["Finish"],
    button_html: `<button class="continue-btn">%choice%</button>`,
};

timeline.push(debrief);

/* Run the experiment */
jsPsych.run(timeline);