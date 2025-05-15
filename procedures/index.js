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

/* Create a handler function for trials */
function handleTrialResponse(data) {
  // If no response was given (null or undefined)
  if (data.response === null || typeof data.response === 'undefined') {
    consecutive_no_responses++;
    checkNoResponseTermination();
  } else {
    // Reset the counter if they did respond
    consecutive_no_responses = 0;
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

var checkBrowser = {
  type: jsPsychBrowserCheck,
  inclusion_function: (data) => {
    return data.browser == 'chrome' && data.mobile === false
  },
  exclusion_message: (data) => {
    if(data.mobile){
      return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>';
    } else if(data.browser !== 'chrome'){
      return '<p>You must use Chrome as your browser to complete this experiment.</p>'
    }
  }
};
timeline.push(checkBrowser);


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
            <p>The experiment will take approximately 40 minutes. You will be compensated $15 for your time.</p>
        </div>
      `,
  choices: ["Continue"],
  button_html: `<button class="continue-btn">%choice%</button>`,
};
timeline.push(instructions);

/* define welcome message trial */
var legalinfo = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
        <div class="text" id="irb">
            
                <h3>Nonmedical Human Participants Consent Form and Waiver of Documentation</h3>
                <p>
                    <strong>STUDY TITLE:</strong> Language Production and Comprehension Studies
                </p>
                <p><strong>PROTOCOL DIRECTOR:</strong> Meghan Sumner</p>
                <p>		
                    <strong>DESCRIPTION:</strong> We invite you to participate in a research study on language production and comprehension. In this experiment, you will complete a linguistic task online such as reading sentences or words, naming pictures or describing scenes, making up sentences of your own, or participating in a simple language game.
                    </p>
                <p>		
                    <strong>RISKS AND BENEFITS:</strong> There are no known risks, costs, or discomforts in this study and this judgment is based on a large body of experience with the same or similar procedures with people of similar ages, sex, origins, etc. We cannot and do not guarantee or promise that you will receive any benefits from this study. You will help us to understand how people recognize and perceive auditory stimuli.
                </p>	
                <p>	
                    <strong>TIME INVOLVEMENT:</strong> Your participation in this experiment will take less than one hour.
                </p>
                <p>	
                    <strong>PAYMENTS:</strong> You will be paid for your participation at the posted rate, consisted with online payment standards.
                    </p>
                <p>		
                    <strong>SUBJECT'S RIGHTS:</strong> If you have read this form and have decided to participate in this project, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. You have the right to refuse to answer particular questions. Your individual privacy will be maintained in all published and written data resulting from the study.
                </p>
                <p>			
                    <strong>CONTACT INFORMATION:</strong><BR>
                    Questions, Concerns, or Complaints: If you have any questions, concerns or complaints about this research study, its procedures, risks and benefits, please contact Prof. Meghan Sumner at (650) 723-4284.
                </p>	
                <p>
                    Independent Contact: If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906. You can also write to the Stanford IRB, Stanford University, Stanford, CA 94305-5401 or email irbnonmed@stanford.edu.
                </p>	
                <p>	
                    <strong>WAIVER OF DOCUMENTATION:</strong><BR>
                    If you agree to participate in this research, please continue to begin the study. 
                </p>	
                <p style="font-size: 80%">
                Approval Date: June, 30, 2021<BR>
                Expiration Date: Does Not Expire
                </p>
                
        </div>
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

/* practice trial instructions */
var practiceinstructions_page1 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <center>
      <div class="instruction-box">
        <p>You will now begin the practice trials.</p>
        <p>In each trial, two audio clips will play one after another. You will hear a variety of sentences and phrases spoken by different talkers.</p>
        <p>Each audio clip will only be played once and you will not be able to replay them.</p>
        <p><strong>Your task is to decide which clip sounds more like the speaker was born in Boston.</strong></p>
        <p><strong>These clips come from a range of different people so they might not all sound like your typical Bostonian, but just make your best guess as quickly as possible.</strong></p>        
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
        <p><b>Respond as quickly as possible when both clips have finished playing.</b></p>
        <p>This is a timed task. If you do not respond in time, the next question will appear automatically.</p>
        <p><b>Please answer as quickly and accurately as possible.</b></p>
    </center>
        `,
    choices: ["Continue"],
    button_html: `<button class="continue-btn">%choice%</button>`,
};

timeline.push(practiceinstructions_page1);
timeline.push(practiceinstructions_page2);
/* Practice trials */
for (let i = 0; i < practice_trial_audio_objects.length; i++) {
    timeline.push(practice_trial_audio_objects[i][0]);
    timeline.push(practice_trial_audio_objects[i][1]);

    // Dynamically set the stimulus for response trials
    practice_trial_response_objects[i].stimulus = `
        <center>
            <div id="clip1" class="visual">Clip 1<p>Press "S"</p></div>
            <div id="clip2" class="visual">Clip 2<p>Press "L"</p></div>
        </center>
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;
    timeline.push(practice_trial_response_objects[i]);
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
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <center>
      <div class="instruction-box">
        <p>Please place your left index finger on the "S" key and your right index finger on the "L" key.</p>
        <p><img src="../procedures/keyboard.png" width="500" style="margin-top:-10px"></p>
        <p>If the <strong>first clip</strong> sounds more like someone who was born in Boston, please <strong>press S</strong>.</p>
        <p>If the <strong>second clip</strong> sounds more like someone who was born in Boston, please <strong>press L</strong>.</p>
        <p><b>Respond as quickly as possible when both clips have finished playing.</b></p>
        <p>This is a timed task. If you do not respond in time, the next question will appear automatically.</p>
        <p><b>Please answer as quickly and accurately as possible.</b></p>
    </center>
        `,
    choices: ["Continue"],
    button_html: `<button class="continue-btn">%choice%</button>`,
};

timeline.push(realinstructions_page1);
timeline.push(realinstructions_page2);


/* Real trials */
for (let i = 0; i < all_trial_audio_objects.length; i++) {
    timeline.push(all_trial_audio_objects[i][0]);
    timeline.push(all_trial_audio_objects[i][1]);

    // Dynamically set the stimulus for response trials
    all_trial_response_objects[i].stimulus = `
        <center>
            <div id="clip1" class="visual">Clip 1<p>Press "S"</p></div>
            <div id="clip2" class="visual">Clip 2<p>Press "L"</p></div>
        </center>
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;
    timeline.push(all_trial_response_objects[i]);
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
        regex: /^[0-9]{5}$/,  // Regular expression to validate 5 digits
        error_message: "Please enter a valid 5-digit ZIP code."
      },
      {
        type: 'text',
        prompt: "What was your ZIP code during most of your teenage years?",
        name: 'zipcode_teenage_years',
        required: true,
        input_type: 'text',
        placeholder: 'Enter 5-digit ZIP code',
        regex: /^[0-9]{5}$/,  // Regular expression to validate 5 digits
        error_message: "Please enter a valid 5-digit ZIP code."
      },
      {
        type: 'text',
        prompt: "What was your ZIP code during most of your adult years?",
        name: 'zipcode_adult_years',
        required: true,
        input_type: 'text',
        placeholder: 'Enter 5-digit ZIP code',
        regex: /^[0-9]{5}$/,  // Regular expression to validate 5 digits
        error_message: "Please enter a valid 5-digit ZIP code."
      },
      {
        type: 'text',
        prompt: "What is your current ZIP code?",
        name: 'zipcode_current',
        required: true,
        input_type: 'text',
        placeholder: 'Enter 5-digit ZIP code',
        regex: /^[0-9]{5}$/,  // Regular expression to validate 5 digits
        error_message: "Please enter a valid 5-digit ZIP code."
      },
      
      
      {
        type: 'multi-choice',
        prompt: "What is your gender?",
        name: 'gender',
        options: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to answer'],
        required: false,
      },
      {
        type: 'drop-down',
        prompt: "What year were you born?",
        name: 'age',
        options: ['2005', '2004', '2003', '2002', '2001', '2000', '1999', '1998', '1997', '1996', '1995', '1994', '1993', '1992', '1991', '1990', '1989', '1988', '1987', '1986', '1985', '1984', '1983', '1982', '1981', '1980', '1979', '1978', '1977', '1976', '1975', '1974', '1973', '1972', '1971', '1970', '1969', '1968', '1967', '1966', '1965', '1964', '1963', '1962', '1961', '1960', '1959', '1958', '1957', '1956', '1955', '1954', '1953', '1952', '1951', '1950', '1949', '1948', '1947', '1946', '1945', '1944', '1943', '1942', '1941', '1940', '1939', '1938', '1937', '1936', '1935', '1934', '1933', 'Prefer not to answer'],
        required: true,
      },
      {
        type: 'multi-select',
        prompt: "What is your race? Please select all that apply.",
        name: 'race',
        options: [
          'American Indian or Alaska Native',
          'Asian',
          'Black or African American',
          'Hispanic or Latino',
          'Middle Eastern or North African',
          'Native Hawaiian or Pacific Islander',
          'White',
          'Prefer not to answer'
        ],
        required: true,
      },
      
      {
        type: 'text',
        prompt: "What is your estimated total yearly household income (in USD)?",
        name: 'income',
        textbox_columns: 9,
        input_type: "number",
        required: true,
      },
      {
        type: 'multi-choice',
        prompt: "What is your highest level of education?",
        name: 'education',
        options: ['No qualification', 'Primary school', 'Secondary school', 'Junior college/Polytechnic', 'Undergraduate degree', 'Postgraduate degree', 'Prefer not to answer'],
        required: false,
      }
    ]
  ],
  button_label_finish: 'Continue',
};
timeline.push(survey1);

/* survey 2: language background questions */
var survey2a = {
  type: jsPsychSurveyHtmlForm,
  preamble: `<p>What languages do you speak?</p>
  <p>Please indicate up to 5 languages and list them <b>in order of descending frequency of use</b>, i.e., Language 1 is the most frequently spoken language, Language 2 the second-most frequently spoken language, and so on.</p>
  <p>For example, if English is Language 1, Cantonese is Language 2, and Spanish is Language 3, that means you speak English the most frequently, Cantonese the second-most frequently, and Spanish the least frequently.
  </p>`,
  html: `<p>
  <input name="lang1" type="text" placeholder="Language 1" required><BR><BR>
  <input name="lang2" type="text" placeholder="Language 2"><BR><BR>
  <input name="lang3" type="text" placeholder="Language 3"><BR><BR>
  <input name="lang4" type="text" placeholder="Language 4"><BR><BR>
  <input name="lang5" type="text" placeholder="Language 5">
  </p>`
};
timeline.push(survey2a);

var survey2b_part1 = {
  type: jsPsychSurvey,
  pages: [
    [
      {
        type: 'text',
        prompt: "How many generations of your family have lived in this area? (If you're the first generation, please enter 1.)",
        name: 'family_generations_in_area',
        required: true
      },
      {
        type: 'multi-choice',
        prompt: "Do you think there is a distinct Boston accent?",
        name: 'boston_accent_opinion',
        options: ['Yes', 'No', 'Not sure'],
        required: true
      },
      {
        type: 'text',
        prompt: "Are there any areas where people sound like they're from Boston? Please specify. (For example, 'South Boston' or 'Dorchester')",
        name: 'boston_accent_area',
        required: true
      }
    ]
  ],
  button_label_finish: 'Continue',
};
timeline.push(survey2b_part1);

var survey2b_part2 = {
  type: jsPsychSurvey,
  pages: [
    [
      {
        type: 'multi-choice',
        prompt: "Do you speak with a Boston accent?",
        name: 'speak_with',
        options: ['Yes', 'No'],
        required: true,
      },
      {
        type: 'text',
        prompt: "Approximately what percentage of the people you know have immigrated to this country? Please enter a number.",
        name: 'immigrant_percentage',
        required: true
      },
      {
        type: 'text',
        prompt: "How many people do you hear in a given week that speak with a Boston accent?",
        name: 'Boston_people',
        input_type: "number",
        required: true,
      },
      {
        type: 'multi-choice',
        prompt: "Do your friends speak with a Boston accent?",
        name: 'boston_friends',
        options: ['Yes', 'No'],
        required: true,
      },
      {
        type: 'multi-choice',
        prompt: "Does anyone in your family speak with a Boston accent?",
        name: 'boston_family',
        options: ['Yes', 'No'],
        required: true,
      }
    ]
  ],
  button_label_finish: 'Continue',
};
timeline.push(survey2b_part2);


/* survey 3: open-ended Boston questions */

var survey3a = {
  type: jsPsychSurveyHtmlForm,
  preamble: '<p>Thinking to the experiment, list three attributes to describe the speakers that sounded like they were more likely to have been born in Boston:</p>',
  html: '<p><input name="word1" class="try" type="text" placeholder="Word 1" required><BR><BR><input name="word2" type="text" placeholder="Word 2" required><BR><BR><input name="word3" type="text" placeholder="Word 3" required></p>'
};
timeline.push(survey3a);

var survey3b = {
  type: jsPsychSurvey,
  pages: [
    [
      {
        type: 'text',
        prompt: "In your opinion, how have changes in your neighborhood (e.g., new businesses, buildings, or residents) affected daily life? What do you like or dislike about these changes?",
        name: 'neighborhood_changes_opinion',
        required: true,
      },
      {
        type: 'text',
        prompt: "What are the top three issues that are affecting your community?",
        name: 'community_issues',
        required: true,
      },
      {
        type: 'multi-choice',
        prompt: "How important is it to preserve the original character or culture of a neighborhood?",
        name: 'preserve_culture_importance',
        options: ['Very important', 'Important', 'Neutral', 'Not important', 'Not important at all'],
        required: true,
      }
    ]
  ],
  button_label_finish: 'Continue',
};
timeline.push(survey3b);


/* survey 4: language attitude questions */
var likert_scale = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree"
];

var survey4 = {
  type: jsPsychSurveyLikert,
  preamble: `Please rate how much you agree or disagree with the following statements.`,
  questions: [
    { prompt: "The Boston accent is just bad English.", name: 'likert_badenglish', labels: likert_scale, required: true },
    { prompt: "The Boston accent is a key part of Bostonian identity.", name: 'likert_identity', labels: likert_scale, required: true },
    { prompt: "The Boston accent brings together people from different backgrounds in the area.", name: 'likert_unity', labels: likert_scale, required: true },
    { prompt: "It would be better for Boston if the Boston accent faded away.", name: 'likert_disappear', labels: likert_scale, required: true },
  ],
  randomize_question_order: true,
};
timeline.push(survey4);

/* emotion scale */
var emotion = {
  type: jsPsychSurveyLikert,
  scale_width: 700,
  questions: [
    {
      prompt: `
      <p style="font-weight: 500">How do you feel right now? Please indicate how you are feeling using the following scale.</p>
      <center><img src="../procedures/emotionscale.png"></center>
      `, 
      labels: [
        "1", 
        "2", 
        "3", 
        "4", 
        "5"
      ]
    }
  ]
};
timeline.push(emotion);

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

/* payment information */
var payment = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: `
            <div class="text" id="trial">
            <p>Please provide your email address in the field below for participant reimbursement purposes.</p>
            </div>
            `,
      name: 'payment'
    }
  ]
};
timeline.push(payment);

/* thank you */
const thankyou = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
        <div class="text" id="trial">
            <p>Thank you for completing the experiment!</p>
            <p>We will contact you soon to arrange for participant reimbursement.</p>
            <p>Please click the "Submit" button to submit your responses and complete the study.</p>
        </div>
      `,
  choices: ["Submit"],
  button_html: `<button class="submit-btn">%choice%</button>`
};
timeline.push(thankyou);

/* start the experiment */
jsPsych.run(timeline);
