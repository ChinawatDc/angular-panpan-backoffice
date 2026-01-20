import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../../shared/footer/footer';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout { }
