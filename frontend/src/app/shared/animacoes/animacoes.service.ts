import { Injectable } from '@angular/core';
import {
  Observable,
  delay,
  iif,
  merge,
  mergeMap,
  of,
  tap,
  throwError,
  timer,
} from 'rxjs';

const ANIMATION_DURATIONS = {
  FLASH: 1500,
  MINIMIZE: 300,
  SLIDE_OUT_RIGHT: 500,
};

@Injectable({
  providedIn: 'root',
})
export class AnimacoesService {
  constructor() {}

  animateById(
    id: string,
    animationCSSClass: string,
    duration: number
  ): Observable<void> {
    const element = document.getElementById(id);

    return of(null).pipe(
      tap(() => element.classList.add(animationCSSClass)),
      delay(duration),
      tap(() => element.classList.remove(animationCSSClass))
    );
  }

  animateElement(
    element: HTMLElement,
    animationCSSClass: string,
    duration: number
  ): Observable<void> {
    return of(null).pipe(
      tap(() => element.classList.add(animationCSSClass)),
      delay(duration),
      tap(() => element.classList.remove(animationCSSClass))
    );
  }

  keepAnimatingElement(
    element: HTMLElement,
    animationCSSClass: string,
    duration: number
  ): Observable<void> {
    return of(null).pipe(
      tap(() => element.classList.add(animationCSSClass)),
      delay(duration)
    );
  }

  keepAnimatingById(
    id: string,
    animationCSSClass: string,
    duration: number
  ): Observable<void> {
    const element = document.getElementById(id);

    return of(null).pipe(
      tap(() => element.classList.add(animationCSSClass)),
      delay(duration)
    );
  }

  scrollIntoView(id: string): Observable<void> {
    return of(null).pipe(
      tap(() =>
        document.getElementById(id).scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      )
    );
  }

  flash(id: string): Observable<void> {
    return this.animateById(id, 'app-flash', ANIMATION_DURATIONS.FLASH);
  }

  minimize(id: string): Observable<void> {
    return this.keepAnimatingById(
      id,
      'app-minimize',
      ANIMATION_DURATIONS.MINIMIZE
    );
  }

  minimizeElement(element: HTMLElement): Observable<void> {
    return this.keepAnimatingElement(
      element,
      'app-minimize',
      ANIMATION_DURATIONS.MINIMIZE
    );
  }

  slideOutRight(id: string): Observable<void> {
    return this.keepAnimatingById(
      id,
      'app-slide-out-right',
      ANIMATION_DURATIONS.SLIDE_OUT_RIGHT
    );
  }
}
