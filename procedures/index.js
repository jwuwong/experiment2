/* Initialize jsPsych */
var jsPsych = initJsPsych({
  on_finish: function() {
    proliferate.submit({"trials": jsPsych.data.get().values()});
  }
});

/* Create timeline */
var timeline = [];

const sounds = [ // These are just the practice trial sounds! REAL trial sounds are in the audio folder
  '../practice/trial1_clip1.WAV',
  '../practice/trial1_clip2.WAV',
  '../practice/trial2_clip1.WAV',
  '../practice/trial2_clip2.WAV',
  '../practice/trial3_clip1.WAV',
  '../practice/trial3_clip2.WAV'
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


var enter_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: true
  };
  
timeline.push(enter_fullscreen);

/* Consent form */
var check_consent = function(elem) {
    if (document.getElementById('consent_checkbox').checked) {
      return true;
    }
    else {
      alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
      return false;
    }
    return false;
  };
  
  var consent_page1 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
  <div class="consent-container">
      <div class="consent-box">
          <h2>Research Consent Form</h2>
          
          <div class="section">
              <h3>Title of Research Study</h3>
              <p>Understanding Language Perception and Production</p>
          </div>
          
          <div class="section">
              <h3>Researcher</h3>
              <p>Chigusa Kurumada, Department of Brain and Cognitive Sciences</p>
          </div>
          
          <div class="section">
              <h3>What will I be asked to do?</h3>
              <p>The study investigates how people process language. 
              During the study, you will read and/or listen to language materials 
              and answer some questions about them. The study will take up to 30 
              minutes.</p>
          </div>
          
          <div class="section">
              <h3>What are the risks involved in participating in this study?</h3>
              <p>There are no known risks associated with participation in this study. 
              The risks associated with participation in this study are no greater than 
              those ordinarily encountered in daily life or during the performance of 
              routine procedures.</p>
          </div>
          
          <div class="section">
              <h3>Will I be compensated?</h3>
              <p>You will be compensated through Prolific at a rate of $9.00 per hour 
              for participating in this study.</p>
          </div>
      </div>
  </div>
  `,
    choices: ["Continue"],
    button_html: '<button class="continue-btn">%choice%</button>',
  };
  
  var consent_page2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
  <div class="consent-container">
      <div class="consent-box">
          <div class="section">
              <h3>Can I stop participating at any time?</h3>
              <p>Your participation in this study is completely voluntary and you are 
              free to choose whether to be in it or not. If you choose to be in this 
              study, you may subsequently withdraw from it at any time without penalty 
              or consequences of any kind. You may also refuse to answer any questions 
              you do not want to answer and still remain in the study.</p>
          </div>
          
          <div class="section">
              <h3>Will my identity and responses be kept confidential?</h3>
              <p>All data from this study are strictly confidential. The results of the 
              study may be published or otherwise made public, but no personally 
              identifiable information will be shared. Any reports based on this 
              research will use only aggregate data and will not identify you or any 
              individual as being affiliated with this project.</p>
          </div>
          
          <div class="section">
              <h3>Whom can I contact if I have questions or concerns?</h3>
              <p>Chigusa Kurumada, (585) 275-8705, <a href="mailto:ckurumada@ur.rochester.edu">ckurumada@ur.rochester.edu</a></p>
              <p>The University of Rochester Research Subjects Review Board, 265 Crittenden Blvd., 
              CU 420315, Rochester, NY 14642, (585) 276-0005 or (877) 449-4441.</p>
          </div>
          
          <div class="section">
              <h3>Agreement</h3>
              <p>The above information has been explained to me and all my current questions 
              have been answered. I understand that I am encouraged to ask questions, voice 
              concerns, or make complaints about any aspect of this research study during its 
              course, and that such future questions, concerns, or complaints will be answered 
              by the researchers listed on the first page of this form.</p>
          </div>
      </div>
  </div>
  `,
    choices: ["Continue"],
    button_html: '<button class="continue-btn">%choice%</button>',
  };
  
  var consent_page3 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
  <div class="consent-container">
      <div class="consent-box">
          <div class="section">
              <h3>Final Agreement</h3>
              <p>I understand that I may withdraw my consent and discontinue participation at 
              any time without penalty or loss of benefits to which I am otherwise entitled. 
              I understand that data collected as part of this research project will be kept 
              strictly confidential and that the confidentiality of my data is not guaranteed 
              after I transmit it over the internet to the researcher. Finally, I understand 
              that I will be given a copy of this consent form for my own records.</p>
              
              <p>By clicking the "I agree" button below, I certify that I am 18 years of age 
              or older, I consent to participate in this research study, and I agree to be 
              audio-recorded during the experiment.</p>
              
              <p style="text-align:center; margin-top: 30px;">
                  <label style="font-size: 16px;">
                      <input type="checkbox" id="consent_checkbox" />
                      I agree to participate in this study.
                  </label>
              </p>
          </div>
      </div>
  </div>
  `,
    choices: ["Continue"],
    button_html: '<button class="continue-btn">%choice%</button>',
    on_finish: function(data){
      if(document.getElementById('consent_checkbox').checked) {
        data.consent = true;
      } else{
        data.consent = false;
      }
    }
  };

timeline.push(consent_page1);
timeline.push(consent_page2);
timeline.push(consent_page3);


var welcome = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
  <center>
    <div class="instruction-box">
      <p>Welcome to the experiment!</p>
      <p>Click <strong>Continue</strong> to begin.</p>
  </center>
      `,
  choices: ["Continue"],
  button_html: `<button class="continue-btn">%choice%</button>`,
};
timeline.push(welcome);


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