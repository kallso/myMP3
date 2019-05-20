/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener(
            "deviceready",
            this.onDeviceReady.bind(this),
            false
        );
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent("deviceready");
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // BUTTONS
        const playBtn = document.getElementById("play");
        const shuffleBtn = document.getElementById("shuffle");
        const previousBtn = document.getElementById("previous");
        const nextBtn = document.getElementById("next");
        const repeatBtn = document.getElementById("repeat");
        const volumeSlider = document.getElementById("volume-slider");
        const playlistBtn = document.getElementById("playlistBtn");
        const playCursor = document.getElementById("song-played-progress");
        const songDuration = document.getElementById("songDuration");
        const currentPos = document.getElementById("currentPos");
        const playlist = document.getElementById("playlist");
        const songTitle = document.getElementById("songTitle");
        const songAlbumArtist = document.getElementById("songAlbumArtist");

        
        // STATE
        my_media = null;     // NE PAS OUBLIER DE REMETTRE 'let' DEVANT A LA FIN DU DEV
        let mediaTimer = null;
        let state = "paused";
        index = 0;
        wasStoppedIntentionallyInCode = false;

        // Retreiving PLAYLIST
        listDir(cordova.file.applicationDirectory + "www/audio/");
        

        // EVENTS
        playBtn.addEventListener("click", playPauseStop);
        playBtn.addEventListener("long-press", playPauseStop);
        volumeSlider.addEventListener("input", volumeControl);
        playlistBtn.addEventListener("click", playlistControl);
        playCursor.addEventListener("input", navigateMusic);
        nextBtn.addEventListener("click", changeMusic);
        previousBtn.addEventListener("click", changeMusic);

        function playCursorControl() {
            this.style.background = "linear-gradient(to right, #fff 0%, #fff " + (this.value / this.max) * 100 + "%, #000 " + (this.value / this.max) * 100 + "%, black 100%)";
        }

        const updatePlayCursor = playCursorControl.bind(playCursor);
        
        function navigateMusic() {
            updatePlayCursor();   
            my_media.seekTo(this.value * 1000);
        }

        function changeMusic(e) {
            if (e.target.id === 'next') {
                if (!playlistArray[index + 1]) {
                    index = -1;
                }
                stopCreatePlayPause(playlistArray[++index]);
            } else if (e.target.id === 'previous') {
                if (!playlistArray[index - 1]) {
                    index = 7;
                }
                stopCreatePlayPause(playlistArray[--index]);
            }
            
        }

        // CONTROLERS
        function playPauseStop(e) {
            console.log("my-media", my_media);

            if (e.type === "click") {
                if (!my_media) {
                    my_media = createMedia(src);

                    // Get duration
                    let counter = 0;
                    const timerDur = setInterval(function() {
                        counter += 100;
                        if (counter > 2000) {
                            clearInterval(timerDur);
                        }
                        const dur = my_media.getDuration();
                        if (dur > 0) {
                            clearInterval(timerDur);
                            playCursor.max = dur;
                            songDuration.innerHTML = secondsToMinutes(dur);
                        }
                    }, 100);
                }

                if (my_media && state === "stoped") {
                    // Get duration
                    let counter = 0;
                    const timerDur = setInterval(function() {
                        counter += 100;
                        if (counter > 2000) {
                            clearInterval(timerDur);
                        }
                        const dur = my_media.getDuration();
                        if (dur > 0) {
                            clearInterval(timerDur);
                            playCursor.max = dur;
                            songDuration.innerHTML = secondsToMinutes(dur);
                        }
                    }, 100);
                }

                if ((state === "paused" || state === "stoped") && my_media) {
                    my_media.play();
                    wasStoppedIntentionallyInCode = false;


                    playBtn.style.background = "url(img/pause.svg)";
                    state = "playing";

                    // Update my_media position every second
                    if (mediaTimer == null) {
                        mediaTimer = setInterval(function() {
                            // get my_media position
                            if (my_media) {
                                my_media.getCurrentPosition(
                                    // success callback
                                    function(position) {
                                        if (position > -1) {
                                            playCursor.value = position;
                                            updatePlayCursor();
                                            currentPos.innerHTML = secondsToMinutes(position);
                                        }
                                    },
                                    // error callback
                                    function(e) {
                                        console.log("Error getting pos=" + e);
                                        currentPos.innerHTML = "Error: " + e;
                                    }
                                );
                            }
                        }, 1000);
                    }

                } else if (state === "playing" && my_media) {
                    my_media.pause();
                    playBtn.style.background = "url(img/play.svg)";
                    state = "paused";
                }

            } else if (e.type === "long-press") {
                // stop the event from bubbling up
                e.preventDefault();

                if (my_media) {
                    wasStoppedIntentionallyInCode = true;
                    my_media.stop();
                    my_media.release();
                    clearInterval(mediaTimer);
                    //my_media = null;
                    mediaTimer = null;
                    currentPos.innerHTML = "00:00";
                    songDuration.innerHTML = "00:00";
                    playCursor.value = 0;
                    playCursor.max = 0;
                    playCursor.style.background = '#000';
                    playBtn.style.background = "url(img/play.svg)";
                    state = "stoped";
                }
            }
        }

        function volumeControl(e) {
            if (my_media) {
                my_media.setVolume((e.target.value / 100).toFixed(1));
            }
        }

        function playlistControl(e) {
            console.log(e.target);
            e.target.innerHTML =
                e.target.innerHTML === "Show Playlist"
                    ? "Hide Playlist"
                    : "Show Playlist";
            const playlist = e.target.nextSibling.nextSibling;
            console.log(e.target.nextSibling.nextSibling);

            playlist.classList.toggle("animateUp");
            playlist.classList.toggle("animateDown");

            playlist.style.height =
                playlist.style.height === "100%" ? "0" : "100%";
        }

        // FUNCTIONS

        function createMedia(url) {
            // Create the media file at url
            let my_media = new Media(
                url,
                // success callback
                function() {
                    console.log("playAudio():Audio Success");
                },
                // error callback
                function(err) {
                    console.log("playAudio():Audio Error: " + err);
                },
                function(code) {
                    switch (code) {
                        case Media.MEDIA_NONE :
                            console.log('media_status is 0');
                            break;
                        case Media.MEDIA_STARTING :
                            console.log('media_status is 1');
                            break;
                        case Media.MEDIA_RUNNING :
                            console.log('media_status is 2');
                            wasStoppedIntentionallyInCode = false;
                            break;
                        case Media.MEDIA_PAUSED :
                            console.log('media_status is 3');
                            break;
                        case Media.MEDIA_STOPPED :
                            console.log('media_status is 4');
                            if (wasStoppedIntentionallyInCode === false) {
                                navigator.vibrate(100);
                                if (!playlistArray[index + 1]) {
                                    index = -1;
                                }
                                stopCreatePlayPause(playlistArray[++index]);                
                            }
                            break;
                    }
                }
            );
            return my_media;
        }
        
        // assumes num is a whole number
        function pad2Digits(num) {
            var str = num.toString();
            if (str.length === 1) {
            str = '0' + str;
            }
            return str;
        }

        function secondsToMinutes(sec) {
            const minutes = Math.floor(sec / 60);
            const seconds = Math.round(sec) % 60;
            
            const time = pad2Digits(minutes) + ':' + pad2Digits(seconds);

            return time;
        }

        function listDir(path) {
            window.resolveLocalFileSystemURL(
                path,
                function(fileSystem) {
                    var reader = fileSystem.createReader();
                    reader.readEntries(
                        onSuccessCallback,
                        function(err) {
                            console.log(err);
                        }
                    );
                },
                function(err) {
                    console.log(err);
                }
            );
        }

        function onSuccessCallback(entries){
            console.log(entries);
            window.src = entries[index].nativeURL;
            window.playlistArray = entries;
            
            //let html = "";

            entries.forEach((song, key) => {
                song.name = song.name.replace('.mp3','').replace('.mp4','');
                let li = document.createElement("li");
                li.innerHTML = song.name;
                li.addEventListener('click', e => { 
                    stopCreatePlayPause(song, key);       
                });
                playlist.appendChild(li);
                
            });
            
            let songInfo = entries[0].name.split('-');
            songTitle.innerHTML = songInfo[0];
            songAlbumArtist.innerHTML = songInfo[1] + ' - ' + songInfo[2];
        }




        // 2EM CONTROLLER (a factoriser)!!!

        function stopCreatePlayPause(song, songIndex = index) {

            if (my_media) {
                wasStoppedIntentionallyInCode = true;
                my_media.stop();
                my_media.release();
                clearInterval(mediaTimer);
                my_media = null;
                mediaTimer = null;
                currentPos.innerHTML = "00:00";
                songDuration.innerHTML = "00:00";
                playCursor.value = 0;
                playCursor.max = 0;
                playCursor.style.background = '#000';
                playBtn.style.background = "url(img/play.svg)";
                state = "stoped";
            }
    
            if (!my_media) {
    
                const songInfo = song.name.split('-');
                const title = songInfo[0];
                const albumArtist = songInfo[1] + ' - ' + songInfo[2];
                my_media = createMedia(song.nativeURL);
                index = songIndex;
                songTitle.innerHTML = title;
                songAlbumArtist.innerHTML = albumArtist;    
    
                // Get duration
                let counter = 0;
                const timerDur = setInterval(function() {
                    counter += 100;
                    if (counter > 2000) {
                        clearInterval(timerDur);
                    }
                    const dur = my_media.getDuration();
                    if (dur > 0) {
                        clearInterval(timerDur);
                        playCursor.max = dur;
                        songDuration.innerHTML = secondsToMinutes(dur);
                    }
                }, 100);
            }
    
            if ((state === "paused" || state === "stoped") && my_media) {
                my_media.play();
    
                playBtn.style.background = "url(img/pause.svg)";
                state = "playing";
    
                // Update my_media position every second
                if (mediaTimer == null) {
                    mediaTimer = setInterval(function() {
                        // get my_media position
                        if (my_media) {
                            my_media.getCurrentPosition(
                                // success callback
                                function(position) {
                                    if (position > -1) {
                                        playCursor.value = position;
                                        updatePlayCursor();
                                        currentPos.innerHTML = secondsToMinutes(position);
                                    }
                                },
                                // error callback
                                function(e) {
                                    console.log("Error getting pos=" + e);
                                    currentPos.innerHTML = "Error: " + e;
                                }
                            );
                        }
                    }, 1000);
                }
    
            } else if (state === "playing" && my_media) {
                my_media.pause();
                playBtn.style.background = "url(img/play.svg)";
                state = "paused";
            }
        }








        
    
    }
};

app.initialize();
