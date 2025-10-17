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

// New function to generate trial order from specific clip set
function generateTrialOrderFromClipSet(trial_ord, stimuliData, clipSet, num_trials) {
    let clip_nums = [...clipSet]; // Create a copy of the clip set
    shuffle(clip_nums);
    
    for (let i = 0; i < num_trials; i++) {
        let clip1 = clip_nums.pop();
        let clip2 = clip_nums.pop();
        let trial = [stimuliData[clip1], stimuliData[clip2]];
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
function generateBlankTrials(num_trials, audio_array, audio_template, audio_data_template) {
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
        
        let firstAudioPath = '../practice/trial' + trial_num + '_clip1.wav';
        let secondAudioPath = '../practice/trial' + trial_num + '_clip2.wav';

        // First practice audio
        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.trial_duration = 4000;
        firstAudio.trial_ends_after_audio = true;
        firstAudio.response_allowed_while_playing = false;
        firstAudio.choices = "NO_KEYS";
        
        // Capture practice data for first clip
        firstAudio.data.ID = 'practice_trial' + trial_num + '_clip1';
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
        secondAudio.trial_ends_after_audio = false; // Don't end when audio ends
        secondAudio.response_allowed_while_playing = true; // Allow response during audio
        secondAudio.choices = ['s', 'l'];
        
        // Capture practice data for second clip
        secondAudio.data.ID = 'practice_trial' + trial_num + '_clip2';
        secondAudio.data.talker = 'practice_speaker';
        secondAudio.data.gender = 'unknown';
        secondAudio.data.order = 2;
        secondAudio.data.duration = 4;
        secondAudio.data.speech_rate = 'unknown';
        secondAudio.data.transcript = 'practice_transcript';
        secondAudio.data.trial_type = 'practice';
        secondAudio.data.clip1_id = 'practice_trial' + trial_num + '_clip1';
        secondAudio.data.clip2_id = 'practice_trial' + trial_num + '_clip2';

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
        secondAudio.trial_ends_after_audio = false; // Don't end when audio ends
        secondAudio.response_allowed_while_playing = true; // Allow response during audio
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

// Modified generate6Blocks function
function generate6Blocks(stimuliData, num_trials_per_block, audio_template, audio_data_template) {
    const all_blocks = [];
    const total_clips = stimuliData.length;
    
    // Split clips into two sets
    const shortClipSet = createArray(total_clips / 2);
    const longClipSet = createArray(total_clips / 2).map(x => x + (total_clips / 2));
    
    // Determine which type goes first based on counterbalancing
    const firstClipSet = shortFirst ? shortClipSet : longClipSet;
    const secondClipSet = shortFirst ? longClipSet : shortClipSet;
    const firstBlockType = shortFirst ? 'short' : 'long';
    const secondBlockType = shortFirst ? 'long' : 'short';
    
    // Generate 3 blocks of first type
    for (let blockNum = 0; blockNum < 3; blockNum++) {
        let trial_ord = [];
        let audio_trials = [];
        
        // Generate blank trials (only audio, no response trials)
        generateBlankTrials(num_trials_per_block, audio_trials, audio_template, audio_data_template);
        
        // Generate trial order using first clip set
        generateTrialOrderFromClipSet(trial_ord, stimuliData, firstClipSet, num_trials_per_block);
        
        // Fill in the trials
        generateTrials(trial_ord, audio_trials);
        
        // Add block type information to response data (in secondAudio)
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
        
        // Generate blank trials (only audio, no response trials)
        generateBlankTrials(num_trials_per_block, audio_trials, audio_template, audio_data_template);
        
        // Generate trial order using second clip set
        generateTrialOrderFromClipSet(trial_ord, stimuliData, secondClipSet, num_trials_per_block);
        
        // Fill in the trials
        generateTrials(trial_ord, audio_trials);
        
        // Add block type information to response data (in secondAudio)
        for (let i = 0; i < audio_trials.length; i++) {
            audio_trials[i][1].data.block_type = secondBlockType;
            audio_trials[i][1].data.block_number = blockNum + 4;
            audio_trials[i][1].data.counterbalance_id = counterbalanceID;
        }
        
        all_blocks.push(audio_trials);
    }
    
    return all_blocks;
}