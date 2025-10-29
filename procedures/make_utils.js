// Helper function to try both .wav and .WAV extensions
function getAudioPath(folder, filename) {
    // Return both possible paths - jsPsych will try them in order
    return `../${folder}/${filename}.wav`;
}

// More robust version that returns the path but handles errors gracefully
function createRobustAudioPath(folder, filename) {
    // Default to lowercase .wav
    const primaryPath = `../${folder}/${filename}.wav`;
    const fallbackPath = `../${folder}/${filename}.WAV`;
    
    return {
        primary: primaryPath,
        fallback: fallbackPath
    };
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

        // for response (kept for compatibility but not used in timeline)
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

function generatePracticeTrials(audio_trials, response_trials) {
    let firstPrompt = `
        <center>
            <div id="clip1" class="visual-play">Clip 1</div>
            <div class="visual">Clip 2</div>
        </center>
        <p style="text-align:center">Listening to clips</p>`;

    let secondPrompt = `
        <center>
            <div class="visual">Clip 1</div>
            <div id="clip2" class="visual-play">Clip 2</div>
        </center>
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>
        <p style="text-align:center">Press "S" for Clip 1 or "L" for Clip 2</p>`;

    for (let i = 0; i < audio_trials.length; i++) {
        let [firstAudio, secondAudio] = audio_trials[i];
        let response = response_trials[i];
        let trial_num = (i + 1).toString();
        let firstAudioPath = '../practice/trial' + trial_num + '_clip1.wav';
        let secondAudioPath = '../practice/trial' + trial_num + '_clip2.wav';

        // First practice audio - NO responses allowed
        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.choices = "NO_KEYS";
        firstAudio.trial_duration = 4000;
        
        // Capture practice data for first clip
        firstAudio.data.ID = 'practice_trial' + trial_num + '_clip1';
        firstAudio.data.talker = 'practice_speaker';
        firstAudio.data.gender = 'unknown';
        firstAudio.data.order = 1;
        firstAudio.data.duration = 4;
        firstAudio.data.speech_rate = 'unknown';
        firstAudio.data.transcript = 'practice_transcript';

        // Add error handler for first practice audio that tries uppercase if lowercase fails
        firstAudio.on_load = function() {
            const audioElement = document.querySelector('audio');
            if (audioElement) {
                audioElement.addEventListener('error', function(e) {
                    console.warn('Failed to load:', this.src);
                    // Try uppercase version
                    if (this.src.endsWith('.wav')) {
                        const newSrc = this.src.replace('.wav', '.WAV');
                        console.log('Trying uppercase:', newSrc);
                        this.src = newSrc;
                    }
                }, { once: true });
            }
        };

        // Second practice audio - ALLOW responses, RT collection starts here
        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;
<<<<<<< HEAD
        secondAudio.choices = ['s', 'l'];
        secondAudio.trial_duration = 7000;  // 4000ms audio + 3000ms response window
        secondAudio.response_ends_trial = false;  // We'll end it manually after feedback
        secondAudio.trial_ends_after_audio = false;
        secondAudio.response_allowed_while_playing = true;
        
        // Visual feedback with delayed trial end
        secondAudio.on_load = function() {
            let responded = false;
            let jsPsych = this.jsPsych || window.jsPsych;
            
            // Add error handler for audio file
            const audioElement = document.querySelector('audio');
            if (audioElement) {
                audioElement.addEventListener('error', function(e) {
                    console.warn('Failed to load:', this.src);
                    if (this.src.endsWith('.wav')) {
                        const newSrc = this.src.replace('.wav', '.WAV');
                        console.log('Trying uppercase:', newSrc);
                        this.src = newSrc;
                    }
                }, { once: true });
            }
            
            function handleKeyPress(e) {
                if (responded) return;
                
                let key = e.key.toLowerCase();
                if (key === 's' || key === 'l') {
                    responded = true;
                    
                    // Add visual feedback
                    if (key === 's') {
                        let clip1Element = document.getElementById('clip1');
                        if (clip1Element) {
                            clip1Element.classList.add('selected');
                        }
                    } else if (key === 'l') {
                        let clip2Element = document.getElementById('clip2');
                        if (clip2Element) {
                            clip2Element.classList.add('selected');
                        }
                    }
                    
                    // End trial after 500ms delay to show feedback
                    setTimeout(function() {
                        jsPsych.finishTrial();
                    }, 500);
                }
            }
            
            document.addEventListener('keydown', handleKeyPress);
            this.keyPressHandler = handleKeyPress;
        };

        // Cleanup on trial finish
        secondAudio.on_finish = function(data) {
            if (this.keyPressHandler) {
                document.removeEventListener('keydown', this.keyPressHandler);
            }
        };
=======
        secondAudio.choices = ['s', 'l'];  // Allow S and L responses
        secondAudio.trial_duration = 7000;  // 4000ms audio + 3000ms response window
>>>>>>> parent of e50d11f (fixed response, need to test output and maybe modify feedback)
        
        // Capture practice data for second clip
        secondAudio.data.ID = 'practice_trial' + trial_num + '_clip2';
        secondAudio.data.talker = 'practice_speaker';
        secondAudio.data.gender = 'unknown';
        secondAudio.data.order = 2;
        secondAudio.data.duration = 4;
        secondAudio.data.speech_rate = 'unknown';
        secondAudio.data.transcript = 'practice_transcript';
        
        // Add practice trial information to second audio data
        secondAudio.data.clip1_id = 'practice_trial' + trial_num + '_clip1';
        secondAudio.data.clip2_id = 'practice_trial' + trial_num + '_clip2';
        secondAudio.data.trial_type = 'practice';
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
        <p style="text-align:center">Which clip sounds more like someone who was born in Boston?</p>
        <p style="text-align:center">Press "S" for Clip 1 or "L" for Clip 2</p>`; // prompt for second clip with response instructions


    for (let i = 0; i < trial_ord.length; i++) {
        let [firstClip, secondClip] = trial_ord[i];
        let [firstAudio, secondAudio] = audio_trials[i]; // blank template to fill
        let response = response_trials[i]; // not used in timeline anymore

        let firstAudioPath = '../audio/' + firstClip['Clip ID'] + '.wav';
        let secondAudioPath = '../audio/' + secondClip['Clip ID'] + '.wav';

        // First audio clip - NO responses allowed
        firstAudio.stimulus = firstAudioPath;
        firstAudio.prompt = firstPrompt;
        firstAudio.choices = "NO_KEYS";  // Prevent responses during first clip
        firstAudio.trial_duration = parseFloat(firstClip['Duration (s)']) * 1000 + 500;
        
        // Capture first clip data
<<<<<<< HEAD
        firstAudio.data = {
            ID: firstClip['Clip ID'],
            talker: firstClip['Speaker ID'],
            gender: firstClip['Gender'],
            order: 1,
            duration: firstClip['Duration (s)'],
            speech_rate: firstClip['Speech rate (words per s)'],
            transcript: firstClip['Transcription']
        };

        // Add error handler for first audio that tries uppercase if lowercase fails
        firstAudio.on_load = function() {
            const audioElement = document.querySelector('audio');
            if (audioElement) {
                audioElement.addEventListener('error', function(e) {
                    console.warn('Failed to load:', this.src);
                    // Try uppercase version
                    if (this.src.endsWith('.wav')) {
                        const newSrc = this.src.replace('.wav', '.WAV');
                        console.log('Trying uppercase:', newSrc);
                        this.src = newSrc;
                    }
                }, { once: true });
            }
        };

        // Second audio clip - ALLOW responses during clip + extra time after
        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;
        secondAudio.choices = ['s', 'l'];
        secondAudio.trial_duration = parseFloat(secondClip['Duration (s)']) * 1000 + 3000;
        secondAudio.response_ends_trial = false;  // We'll end it manually after feedback
        secondAudio.trial_ends_after_audio = false;
        secondAudio.response_allowed_while_playing = true;
        
        // Visual feedback with delayed trial end
        secondAudio.on_load = function() {
            let responded = false;
            let jsPsych = this.jsPsych || window.jsPsych;
            
            // Add error handler for audio file
            const audioElement = document.querySelector('audio');
            if (audioElement) {
                audioElement.addEventListener('error', function(e) {
                    console.warn('Failed to load:', this.src);
                    if (this.src.endsWith('.wav')) {
                        const newSrc = this.src.replace('.wav', '.WAV');
                        console.log('Trying uppercase:', newSrc);
                        this.src = newSrc;
                    }
                }, { once: true });
            }
            
            function handleKeyPress(e) {
                if (responded) return;
                
                let key = e.key.toLowerCase();
                if (key === 's' || key === 'l') {
                    responded = true;
                    
                    // Add visual feedback
                    if (key === 's') {
                        let clip1Element = document.getElementById('clip1');
                        if (clip1Element) {
                            clip1Element.classList.add('selected');
                        }
                    } else if (key === 'l') {
                        let clip2Element = document.getElementById('clip2');
                        if (clip2Element) {
                            clip2Element.classList.add('selected');
                        }
                    }
                    
                    // End trial after 500ms delay to show feedback
                    setTimeout(function() {
                        jsPsych.finishTrial();
                    }, 500);
                }
            }
            
            document.addEventListener('keydown', handleKeyPress);
            this.keyPressHandler = handleKeyPress;
        };

        // Cleanup on trial finish
        secondAudio.on_finish = function(data) {
            if (this.keyPressHandler) {
                document.removeEventListener('keydown', this.keyPressHandler);
            }
        };

        // Capture second clip data
        secondAudio.data = {
            ID: secondClip['Clip ID'],
            talker: secondClip['Speaker ID'],
            gender: secondClip['Gender'],
            order: 2,
            duration: secondClip['Duration (s)'],
            speech_rate: secondClip['Speech rate (words per s)'],
            transcript: secondClip['Transcription'],
            // Trial pair information
            clip1_id: firstClip['Clip ID'],
            clip2_id: secondClip['Clip ID'],
            clip1_speaker: firstClip['Speaker ID'],
            clip2_speaker: secondClip['Speaker ID'],
            clip1_gender: firstClip['Gender'],
            clip2_gender: secondClip['Gender'],
            clip1_transcript: firstClip['Transcription'],
            clip2_transcript: secondClip['Transcription'],
            trial_type: 'experimental'
        };
=======
        firstAudio.data.ID = firstClip['Clip ID'];
        firstAudio.data.talker = firstClip['Speaker ID'];
        firstAudio.data.gender = firstClip['Gender'];
        firstAudio.data.order = 1;
        firstAudio.data.duration = firstClip['Duration (s)'];
        firstAudio.data.speech_rate = firstClip['Speech rate (words per s)'];
        firstAudio.data.transcript = firstClip['Transcription'];

        // Second audio clip - ALLOW responses, RT collection starts here
        secondAudio.stimulus = secondAudioPath;
        secondAudio.prompt = secondPrompt;
        secondAudio.choices = ['s', 'l'];  // Allow S and L keys
        secondAudio.trial_duration = parseFloat(secondClip['Duration (s)']) * 1000 + 3000;  // Audio duration + 3s response window
        
        // Capture second clip data
        secondAudio.data.ID = secondClip['Clip ID'];
        secondAudio.data.talker = secondClip['Speaker ID'];
        secondAudio.data.gender = secondClip['Gender'];
        secondAudio.data.order = 2;
        secondAudio.data.duration = secondClip['Duration (s)'];
        secondAudio.data.speech_rate = secondClip['Speech rate (words per s)'];
        secondAudio.data.transcript = secondClip['Transcription'];
        
        // Add trial pair information to second audio data
        secondAudio.data.clip1_id = firstClip['Clip ID'];
        secondAudio.data.clip2_id = secondClip['Clip ID'];
        secondAudio.data.clip1_speaker = firstClip['Speaker ID'];
        secondAudio.data.clip2_speaker = secondClip['Speaker ID'];
        secondAudio.data.clip1_gender = firstClip['Gender'];
        secondAudio.data.clip2_gender = secondClip['Gender'];
        secondAudio.data.clip1_transcript = firstClip['Transcription'];
        secondAudio.data.clip2_transcript = secondClip['Transcription'];
        secondAudio.data.trial_type = 'experimental';
>>>>>>> parent of e50d11f (fixed response, need to test output and maybe modify feedback)
    }
}

function generateTrialOrderFromClipSet(trial_ord, stimuliData, clipSet, num_trials) {
    // Filter to only include clips from the specified set
    const availableClips = stimuliData.filter(clip => clipSet.includes(clip['Clip ID']));
    
    // Shuffle the available clips
    const shuffledClips = shuffleArray([...availableClips]);
    
    // Generate trials
    for (let i = 0; i < num_trials; i++) {
        const firstClipIndex = i * 2;
        const secondClipIndex = i * 2 + 1;
        
        if (firstClipIndex >= shuffledClips.length || secondClipIndex >= shuffledClips.length) {
            console.error('Not enough clips to generate all trials');
            break;
        }
        
        trial_ord.push([shuffledClips[firstClipIndex], shuffledClips[secondClipIndex]]);
    }
}

// Shuffle function (Fisher-Yates)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}