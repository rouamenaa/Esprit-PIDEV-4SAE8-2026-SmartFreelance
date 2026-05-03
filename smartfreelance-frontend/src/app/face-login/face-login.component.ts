import { Component, OnInit, ViewChild, ElementRef, Output } from '@angular/core';
import * as faceapi from 'face-api.js';
import { EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // ✅ ADD
import { Input } from '@angular/core';


@Component({
  selector: 'app-face-login',
  standalone: true,
  templateUrl: './face-login.component.html'
})
export class FaceLoginComponent implements OnInit {

  @ViewChild('video') video!: ElementRef;

  @Output() faceMatched = new EventEmitter<any>();
  @Output() faceError = new EventEmitter<string>();
  @Input() email!: string;

  
  faceDescriptor: Float32Array | null = null;

  constructor(private http: HttpClient) {} // ✅ inject

  async ngOnInit() {
    await this.loadModels();
    await this.startVideo();
  }

  async loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  }

  async startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.nativeElement.srcObject = stream;

    this.video.nativeElement.onloadedmetadata = () => {
      this.detectFace();
    };
  }

  async detectFace() {
    const detection = await faceapi
      .detectSingleFace(this.video.nativeElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      this.faceError.emit("No face detected");
      return;
    }

    console.log('FACE:', detection);

    this.faceDescriptor = detection.descriptor;

    // ✅ CALL BACKEND HERE
    this.faceLogin();
  }

  faceLogin() {
    if (!this.faceDescriptor) return;
    const descriptorArray = Array.from(this.faceDescriptor);
    this.http.post("http://localhost:8085/auth/face-login", {
      email: this.email,
      descriptor: descriptorArray
    }).subscribe({
       next: (res: any) => {
        console.log("Face login success", res);
        this.faceMatched.emit(res); // send result to parent
      },
      error: (err) => {
        console.error("Face login error", err);
        this.faceError.emit("Face not recognized");
      }
    });
  }
  
}