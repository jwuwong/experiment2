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

// generate random trial order for one block:
function generateTrialOrder(trial_ord, stimuliData, num_clips, num_trials) {
    let clip_nums = createArray(num_clips);
    shuffle(clip_nums);
    //console.log("clip nums", clip_nums);
    //console.log("stimuli data first", stimuliData[0]);
    for (let i = 0; i < num_trials; i++) {
        let clip1 = clip_nums.pop();
        let clip2 = clip_nums.pop();
        let trial = [stimuliData[clip1], stimuliData[clip2]];
        trial_ord.push(trial);
    }
    //console.log("trial ord", trial_ord)
    return trial_ord; // lst of [id1, id2]
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
    }
}