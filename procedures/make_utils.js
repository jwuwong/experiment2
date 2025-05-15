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
        let trial_num = (i + 1).toString();
        let firstAudioPath = '../practice/' + 'trial' + trial_num + '_clip1' + '.WAV';
        let secondAudioPath = '../practice/' + 'trial' + trial_num + '_clip2' + '.WAV';

        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.trial_duration = 4000;

        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;
        secondAudio.trial_duration = 4000;

       
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

        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.trial_duration = parseFloat(firstClip['Duration (s)']) * 1000 + 500;

        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;
        secondAudio.trial_duration = parseFloat(secondClip['Duration (s)']) * 1000;


    }
}