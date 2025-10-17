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
    order: 0,
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

// Generate trial order from specific clip set
// Generate trial order from specific clip set - with simple reuse/replacement
function generateTrialOrderFromClipSet(trial_ord, stimuliData, clipSet, num_trials) {
    console.log(`Generating ${num_trials} trials from ${clipSet.length} available clips (with reuse)`);
    
    // Check if we have any clips at all
    if (clipSet.length === 0) {
        console.error(`No clips available!`);
        return trial_ord;
    }
    
    for (let i = 0; i < num_trials; i++) {
        // Randomly select two clips from the set
        let clipIndex1 = clipSet[Math.floor(Math.random() * clipSet.length)];
        let clipIndex2 = clipSet[Math.floor(Math.random() * clipSet.length)];
        
        // Make sure we don't use the same clip twice in one trial
        // If they're the same and we have more than one clip, pick again
        while (clipIndex1 === clipIndex2 && clipSet.length > 1) {
            clipIndex2 = clipSet[Math.floor(Math.random() * clipSet.length)];
        }
        
        let clip1 = stimuliData[clipIndex1];
        let clip2 = stimuliData[clipIndex2];
        
        // Verify clips exist
        if (!clip1 || !clip2 || !clip1['Clip ID'] || !clip2['Clip ID']) {
            console.error(`Problem with clips at indices ${clipIndex1}, ${clipIndex2}`);
            continue;
        }
        
        let trial = [clip1, clip2];
        trial_ord.push(trial);
    }
    
    console.log(`Successfully created ${trial_ord.length} trials`);
    return trial_ord;
}

// Create deep copy of audio templates to generate blank trials
function generateBlankTrials(num_trials, audio_array, audio_template, audio_data_template) {
    for (let i = 0; i < num_trials; i++) {
        // for audio; two clips
        let trial_copy = []
        for (let j = 0; j < 2; j++) {
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
    }
}

// Modified generatePracticeTrials function
function generatePracticeTrials(num_practice_trials, audio_trials, audio_template, audio_data_template) {
    let firstPrompt = `
        <center>
            <div id="clip1" class="visual-play">Clip 1</div>
            <div class="visual">Clip 2</div>
        </center>
        <p style="text-align:center">Listening to clips</p>`;

    let secondPrompt = `
        <center>
            <div id="clip1" class="visual">Clip 1<p>Press "S"</p></div>
            <div id="clip2" class="visual-play">Clip 2<p>Press "L"</p></div>
        </center>
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;

    // Generate blank trials
    generateBlankTrials(num_practice_trials, audio_trials, audio_template, audio_data_template);

    for (let trial_num = 0; trial_num < num_practice_trials; trial_num++) {
        let [firstAudio, secondAudio] = audio_trials[trial_num];
        
        let firstAudioPath = '../practice/trial' + (trial_num + 1) + '_clip1.wav';
        let secondAudioPath = '../practice/trial' + (trial_num + 1) + '_clip2.wav';

        // First practice audio
        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.trial_duration = 4000;
        firstAudio.trial_ends_after_audio = true;
        firstAudio.response_allowed_while_playing = false;
        firstAudio.choices = "NO_KEYS";
        
        // Capture practice data for first clip
        firstAudio.data.ID = 'practice_trial' + (trial_num + 1) + '_clip1';
        firstAudio.data.talker = 'practice_speaker';
        firstAudio.data.gender = 'unknown';
        firstAudio.data.order = 1;
        firstAudio.data.duration = 4;
        firstAudio.data.speech_rate = 'unknown';
        firstAudio.data.transcript = 'practice_transcript';
        firstAudio.data.trial_type = 'practice';

        // Second practice audio - NOW ACCEPTS RESPONSES
        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;
        secondAudio.trial_duration = 4000;
        secondAudio.trial_ends_after_audio = false;
        secondAudio.response_allowed_while_playing = true;
        secondAudio.choices = ['s', 'l'];
        
        // Capture practice data for second clip
        secondAudio.data.ID = 'practice_trial' + (trial_num + 1) + '_clip2';
        secondAudio.data.talker = 'practice_speaker';
        secondAudio.data.gender = 'unknown';
        secondAudio.data.order = 2;
        secondAudio.data.duration = 4;
        secondAudio.data.speech_rate = 'unknown';
        secondAudio.data.transcript = 'practice_transcript';
        secondAudio.data.trial_type = 'practice';
        secondAudio.data.clip1_id = 'practice_trial' + (trial_num + 1) + '_clip1';
        secondAudio.data.clip2_id = 'practice_trial' + (trial_num + 1) + '_clip2';

        // Add on_finish callback to capture response data
        secondAudio.on_finish = function(data) {
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
        };
    }
}

// Modified generateTrials function
function generateTrials(trial_ord, audio_trials) {
    let firstPrompt = `
        <center>
            <div id="clip1" class="visual-play">Clip 1</div>
            <div class="visual">Clip 2</div>
        </center>
        <p style="text-align:center">Listening to clips</p>`;

    let secondPrompt = `
        <center>
            <div id="clip1" class="visual">Clip 1<p>Press "S"</p></div>
            <div id="clip2" class="visual-play">Clip 2<p>Press "L"</p></div>
        </center>
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>`;

    for (let i = 0; i < trial_ord.length; i++) {
        let [firstClip, secondClip] = trial_ord[i];
        let [firstAudio, secondAudio] = audio_trials[i];

        let firstAudioPath = '../audio/' + firstClip['Clip ID'] + '.WAV';
        let secondAudioPath = '../audio/' + secondClip['Clip ID'] + '.WAV';

        // First audio clip
        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.trial_duration = parseFloat(firstClip['Duration (s)']) * 1000 + 500;
        firstAudio.trial_ends_after_audio = true;
        firstAudio.response_allowed_while_playing = false;
        firstAudio.choices = "NO_KEYS";
        
        // Capture first clip data
        firstAudio.data.ID = firstClip['Clip ID'];
        firstAudio.data.talker = firstClip['Speaker ID'];
        firstAudio.data.gender = firstClip['Gender'];
        firstAudio.data.order = 1;
        firstAudio.data.duration = firstClip['Duration (s)'];
        firstAudio.data.speech_rate = firstClip['Speech rate (words per s)'];
        firstAudio.data.transcript = firstClip['Transcription'];

        // Second audio clip - NOW ACCEPTS RESPONSES
        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;
        secondAudio.trial_duration = parseFloat(secondClip['Duration (s)']) * 1000;
        secondAudio.trial_ends_after_audio = false;
        secondAudio.response_allowed_while_playing = true;
        secondAudio.choices = ['s', 'l'];
        
        // Capture second clip data
        secondAudio.data.ID = secondClip['Clip ID'];
        secondAudio.data.talker = secondClip['Speaker ID'];
        secondAudio.data.gender = secondClip['Gender'];
        secondAudio.data.order = 2;
        secondAudio.data.duration = secondClip['Duration (s)'];
        secondAudio.data.speech_rate = secondClip['Speech rate (words per s)'];
        secondAudio.data.transcript = secondClip['Transcription'];
        secondAudio.data.clip1_id = firstClip['Clip ID'];
        secondAudio.data.clip2_id = secondClip['Clip ID'];

        // Add on_finish callback to capture response data
        secondAudio.on_finish = function(data) {
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
        };
    }
}

// Generate 6 blocks function
// Generate 6 blocks function
function generate6Blocks(stimuliData, num_trials_per_block, audio_template, audio_data_template) {
    const all_blocks = [];
    
    console.log(`Total clips in stimuliData: ${stimuliData.length}`);
    
    // Define counterbalancing
    const counterbalanceID = Math.floor(Math.random() * 2); // 0 or 1
    const shortFirst = counterbalanceID === 0;
    
    // Split clips into short and long sets based on clip IDs
    const shortClipIndices = [];
    const longClipIndices = [];
    
    for (let i = 0; i < stimuliData.length; i++) {
        const clipID = stimuliData[i]['Clip ID'];
        if (!clipID) {
            console.warn(`Clip at index ${i} has no Clip ID`);
            continue;
        }
        
        if (SHORT_CLIPS.includes(clipID)) {
            shortClipIndices.push(i);
        } else if (LONG_CLIPS.includes(clipID)) {
            longClipIndices.push(i);
        } else {
            console.warn(`Clip ${clipID} not in SHORT_CLIPS or LONG_CLIPS`);
        }
    }
    
    console.log(`Short clips: ${shortClipIndices.length}, Long clips: ${longClipIndices.length}`);
    console.log(`${num_trials_per_block} trials per block, 6 blocks total = ${num_trials_per_block * 6} total trials`);
    
    // Determine which type goes first based on counterbalancing
    const firstClipSet = shortFirst ? shortClipIndices : longClipIndices;
    const secondClipSet = shortFirst ? longClipIndices : shortClipIndices;
    const firstBlockType = shortFirst ? 'short' : 'long';
    const secondBlockType = shortFirst ? 'long' : 'short';
    
    console.log(`Counterbalance ID: ${counterbalanceID}, Order: ${firstBlockType} first, then ${secondBlockType}`);
    
    // Generate 3 blocks of first type
    for (let blockNum = 0; blockNum < 3; blockNum++) {
        let trial_ord = [];
        let audio_trials = [];
        
        // Generate blank trials
        generateBlankTrials(num_trials_per_block, audio_trials, audio_template, audio_data_template);
        
        // Generate trial order - clips will be reused randomly
        generateTrialOrderFromClipSet(trial_ord, stimuliData, firstClipSet, num_trials_per_block);
        
        // Fill in the trials
        generateTrials(trial_ord, audio_trials);
        
        // Add block type information
        for (let i = 0; i < audio_trials.length; i++) {
            audio_trials[i][1].data.block_type = firstBlockType;
            audio_trials[i][1].data.block_number = blockNum + 1;
            audio_trials[i][1].data.counterbalance_id = counterbalanceID;
        }
        
        all_blocks.push(audio_trials);
    }
    
    // Generate 3 blocks of second type
    for (let blockNum = 0; blockNum < 3; blockNum++) {
        let trial_ord = [];
        let audio_trials = [];
        
        // Generate blank trials
        generateBlankTrials(num_trials_per_block, audio_trials, audio_template, audio_data_template);
        
        // Generate trial order - clips will be reused randomly
        generateTrialOrderFromClipSet(trial_ord, stimuliData, secondClipSet, num_trials_per_block);
        
        // Fill in the trials
        generateTrials(trial_ord, audio_trials);
        
        // Add block type information
        for (let i = 0; i < audio_trials.length; i++) {
            audio_trials[i][1].data.block_type = secondBlockType;
            audio_trials[i][1].data.block_number = blockNum + 4;
            audio_trials[i][1].data.counterbalance_id = counterbalanceID;
        }
        
        all_blocks.push(audio_trials);
    }
    
    console.log(`Generated ${all_blocks.length} blocks total`);
    return all_blocks;
}


