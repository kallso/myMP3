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
        // BUTTONS - ELEMENTS
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
        const imgAlbum = document.getElementById("imgAlbum");
        const playlistBtnText = document.getElementById("playlistBtn-text");
        const playlistBtnImg = document.getElementById("playlistBtn-img");

        
        // STATE
        my_media = null;
        let mediaTimer = null;
        let state = "paused";
        index = 0;
        randomIndex = 0;
        wasStoppedIntentionallyInCode = false;
        repeat = false;
        shuffle = false;
        volume = "0.5";

        // Retreiving Jackets (images)
        listDir(cordova.file.applicationDirectory + "www/jackets/", listJackets);

        // Retreiving Playlist (songs)
        listDir(cordova.file.applicationDirectory + "www/audio/", listSongs);

        
        // EVENTS
        playBtn.addEventListener("click", playPauseStop);
        playBtn.addEventListener("long-press", playPauseStop);
        volumeSlider.addEventListener("input", volumeControl);
        playlistBtn.addEventListener("click", playlistControl);
        playCursor.addEventListener("input", navigateMusic);
        nextBtn.addEventListener("click", changeMusic);
        previousBtn.addEventListener("click", changeMusic);
        repeatBtn.addEventListener("click", repeatMusic);
        shuffleBtn.addEventListener("click", shuffleMusic);

        /**
        * FUNCTIONS
        **/

        function playCursorControl() {
            this.style.backgroundImage = "linear-gradient(to right, #fff 0%, #fff " + (this.value / this.max) * 100 + "%, #000 " + (this.value / this.max) * 100 + "%, black 100%)";
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
                    index = playlistArray.length;
                }
                stopCreatePlayPause(playlistArray[--index]);
            }        
        }

        function repeatMusic() {
            shuffle = false;
            if (shuffle) shuffleBtn.style.backgroundImage = "url(img/shuffle-on.svg)";
            else shuffleBtn.style.backgroundImage = "url(img/shuffle.svg)";

            repeat = repeat === false ? true : false;
            if (repeat) repeatBtn.style.backgroundImage = "url(img/repeat_one.svg)";
            else repeatBtn.style.backgroundImage = "url(img/repeat.svg)";
        }

        function shuffleMusic() {
            repeat = false;
            if (repeat) repeatBtn.style.backgroundImage = "url(img/repeat-on.svg)";
            else repeatBtn.style.backgroundImage = "url(img/repeat.svg)";

            shuffle = shuffle === false ? true : false;
            if (shuffle) shuffleBtn.style.backgroundImage = "url(img/shuffle-on.svg)";
            else shuffleBtn.style.backgroundImage = "url(img/shuffle.svg)"; 
        }

        function resetMusic() {
            wasStoppedIntentionallyInCode = true;
            my_media.stop();
            my_media.release();
            clearInterval(mediaTimer);
            mediaTimer = null;
            currentPos.innerHTML = songDuration.innerHTML = "00:00";
            playCursor.value = playCursor.max = 0;
            playCursor.style.background = '#000';
            playBtn.style.backgroundImage = "url(img/play.svg)";
            state = "stoped";
        }

        function volumeControl(e) {
            if (my_media) {
                volume = (e.target.value / 100).toFixed(1);
                my_media.setVolume(volume);
            }
        }

        function playlistControl() {
            playlistBtnText.innerHTML =
                playlistBtnText.innerHTML === "Show Playlist"
                    ? "Hide Playlist"
                    : "Show Playlist";

            playlistBtnImg.src =
                playlistBtnImg.src === "file:///android_asset/www/img/down.svg"
                    ? "file:///android_asset/www/img/up.svg"
                    : "file:///android_asset/www/img/down.svg";

            playlist.classList.toggle("animateUp");
            playlist.classList.toggle("animateDown");

            playlist.style.maxHeight =
                playlist.style.maxHeight === "calc(100vh - 4.8rem)" ? "0px" : "calc(100vh - 4.8rem)";
        }

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
                // media_status callback
                function(code) {
                    switch (code) {
                        case Media.MEDIA_NONE :
                            console.log('media_status is NONE (0)');
                            break;
                        case Media.MEDIA_STARTING :
                            console.log('media_status is STARTING (1)');
                            my_media.setVolume(volume);
                            break;
                        case Media.MEDIA_RUNNING :
                            console.log('media_status is RUNNING (2)');
                            wasStoppedIntentionallyInCode = false;
                            break;
                        case Media.MEDIA_PAUSED :
                            console.log('media_status is PAUSED (3)');
                            break;
                        case Media.MEDIA_STOPPED :
                            console.log('media_status is STOPPED (4)');
                            if (wasStoppedIntentionallyInCode === false) {
                                navigator.vibrate(100);
                                if (repeat) {
                                    my_media.play();
                                } else if (shuffle) {
                                    do {
                                        randomIndex = Math.round(Math.random()*playlistArray.length);
                                    } while (index === randomIndex);
                                    stopCreatePlayPause(playlistArray[randomIndex]);
                                    index = randomIndex;
                                } else {
                                    if (!playlistArray[index + 1]) {
                                        index = -1;
                                    }
                                    stopCreatePlayPause(playlistArray[++index]);
                                }
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

        function listDir(path, onSuccessCallback) {
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

        function listSongs(entries) {
            console.log(entries);            
            window.src = entries[index].nativeURL;
            window.playlistArray = entries;
            let songInfo = []; 
            
            playlistArray.forEach((song, key) => {
                
                songInfo = song.name.replace('.mp3','').replace('.mp4','').split('-');
                song.name = songInfo[0].trim();
                song.albumArtist = (songInfo[1] + '-' + songInfo[2]).trim();
            
                jacketsArray.forEach(jacket => {                   
                    if (song.albumArtist === jacket.name) song.jacketURL = jacket.nativeURL;
                });
                
                if (key === 0) {
                    songTitle.innerHTML = song.name;
                    songAlbumArtist.innerHTML = song.albumArtist;
                    imgAlbum.src = song.jacketURL;
                }

                let li = document.createElement("li");
                const playlistJacket = document.createElement("img");
                const playlistSongInfoContainer = document.createElement("div");
                const playlistTitle = document.createElement("div");
                const playlistAlbumArtist = document.createElement("div");

                playlistSongInfoContainer.classList.add("playlistSongInfoContainer");
                playlistTitle.classList.add("playlistTitle");
                playlistAlbumArtist.classList.add("playlistAlbumArtist");

                playlistJacket.src = song.jacketURL;
                playlistTitle.innerHTML = song.name;
                playlistAlbumArtist.innerHTML = song.albumArtist;

                li.appendChild(playlistJacket);
                li.appendChild(playlistSongInfoContainer);
                
                playlistSongInfoContainer.appendChild(playlistTitle);
                playlistSongInfoContainer.appendChild(playlistAlbumArtist);

                li.addEventListener('click', () => {
                    stopCreatePlayPause(song, key);
                    playlistControl();       
                });

                playlist.appendChild(li);
            });
        }

        function listJackets(entries) {
            console.log(entries);
            window.jacketsArray = entries;
            jacketsArray.forEach(jacket => {
                jacket.name = jacket.name.split('.')[0].trim();
            });
        }

        /**
        * CONTROLERS 
        **/

        // Play --> Pause --> Stop CONTROLER     
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


                    playBtn.style.backgroundImage = "url(img/pause.svg)";
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
                    playBtn.style.backgroundImage = "url(img/play.svg)";
                    state = "paused";
                }

            } else if (e.type === "long-press") {
                // stop the event from bubbling up
                e.preventDefault();

                if (my_media) {
                    resetMusic();
                }
            }
        }

        // Stop --> Create --> Play --> Pause CONTROLER
        function stopCreatePlayPause(song, songIndex = index) {

            if (my_media) {
                resetMusic();
                my_media = null;
            }
    
            if (!my_media) {
    
                my_media = createMedia(song.nativeURL);
                index = songIndex;
                songTitle.innerHTML = song.name;
                songAlbumArtist.innerHTML = song.albumArtist;
                imgAlbum.src = song.jacketURL;    
    
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
    
                playBtn.style.backgroundImage = "url(img/pause.svg)";
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
