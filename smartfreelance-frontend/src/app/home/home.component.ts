<<<<<<< HEAD
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
=======
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

@Component({
  selector: 'app-home',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterModule],  
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  freelancers = [
  { name: 'Ali Dev', skill: 'Angular Developer', price: 25 },
  { name: 'Sara UI', skill: 'UI/UX Designer', price: 30 },
  { name: 'John JS', skill: 'Fullstack Developer', price: 40 }
];


}
=======
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {

  @ViewChild('heroCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private animFrameId: number = 0;

  constructor(private router: Router) {}

  freelancers = [
    {
      name: 'Ali Dev',
      skill: 'Angular Developer',
      price: 25,
      rating: 5.0,
      reviews: 42,
      avatarClass: 'av-purple',
      tags: ['Angular', 'TypeScript', 'RxJS']
    },
    {
      name: 'Sara UI',
      skill: 'UI/UX Designer',
      price: 30,
      rating: 4.9,
      reviews: 38,
      avatarClass: 'av-blue',
      tags: ['Figma', 'Prototyping', 'Branding']
    },
    {
      name: 'John JS',
      skill: 'Fullstack Developer',
      price: 40,
      rating: 5.0,
      reviews: 61,
      avatarClass: 'av-green',
      tags: ['React', 'Node.js', 'PostgreSQL']
    },
// =======
// export class HomeComponent {
//   constructor(private router: Router) {}

//   freelancers = [
//     { name: 'Ali Dev',  skill: 'Angular Developer',  price: 25 },
//     { name: 'Sara UI',  skill: 'UI/UX Designer',      price: 30 },
//     { name: 'John JS',  skill: 'Fullstack Developer', price: 40 },
// >>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
  ];

  goTo(path: string) {
    this.router.navigate([path]);
  }

  ngAfterViewInit() {
    this.initCanvas();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const wrap = canvas.parentElement!;

    const resize = () => {
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = [
      'rgba(99,102,241,',
      'rgba(139,92,246,',
      'rgba(129,140,248,',
      'rgba(196,181,253,'
    ];
    const N = 55;

    const particles = Array.from({ length: N }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      c:  COLORS[Math.floor(Math.random() * COLORS.length)],
      a:  Math.random() * 0.5 + 0.15
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#06061a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < N; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Lignes de connexion
        for (let j = i + 1; j < N; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // Point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + p.a + ')';
        ctx.fill();
      }

      this.animFrameId = requestAnimationFrame(draw);
    };

    draw();
  }

}
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
