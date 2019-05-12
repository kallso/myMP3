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
        //const pauseBtn = document.getElementById('pause');

        // VARIABLES
        const optionItem = {
            text: "Jasmin"
        };
        my_media = undefined;

        //const src = "/android_asset/www/audio/" + optionItem.text + ".mp3";
        const src = "/android_asset/www/audio/Joe Satriani - Made of Tears.mp4";
        //const src = "/www/audio/Joe Satriani - Made of Tears.mp4";

        // EVENTS
        playBtn.addEventListener("click", playPause);

        function playPause(e) {
            console.log('my-media', my_media);
            
            if (!my_media) { 
                my_media = createMedia(src); 
            };

            if (!this.classList.contains("playing") && my_media) {
                my_media.play();
                this.classList.toggle("playing");
            } else if (this.classList.contains("playing") && my_media) {
                my_media.pause();
                this.classList.toggle("playing");
            }
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
                }
            );
            return my_media;
        }

        function listDir(path) {
            window.resolveLocalFileSystemURL(
                path,
                function(fileSystem) {
                    var reader = fileSystem.createReader();
                    reader.readEntries(
                        function(entries) {
                            console.log(entries);
                        },
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
        //example: list of www/audio/ folder in cordova/ionic app.
        console.log(listDir(cordova.file.applicationDirectory + "www/audio/"));

        // Play audio
        //

        /*         window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
    
                console.log('file system open: ' + fs.name);
                fs.root.getFile("newPersistentFile.txt", { create: true, exclusive: false }, function (fileEntry) {
            
                    console.log("fileEntry is file?" + fileEntry.isFile.toString());
                    fileEntry.name == 'Jasmin.mp3'
                    fileEntry.fullPath == '/home/ubuntu/dev/cordova/myMP3/platforms/android/app/src/main/assets/www/audio/Jasmin.mp3'
                    writeFile(fileEntry, null);
            
                }, onErrorCreateFile);
            
            }, onErrorLoadFs);
            
    
            function readFile(fileEntry) {
    
                fileEntry.file(function (file) {
                    var reader = new FileReader();
            
                    reader.onloadend = function() {
                        console.log("Successful file read: " + this.result);
                        displayFileData(fileEntry.fullPath + ": " + this.result);
                    };
            
                    reader.readAsText(file);
            
                }, onErrorReadFile);
            }
            
            console.log(window.requestFileSystem(readFile()));
     */
    }
};

app.initialize();
