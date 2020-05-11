import { ViewEncapsulation, Component, Input, ElementRef, OnChanges, AfterViewInit } from '@angular/core';
import { LightBox } from '../common/lightbox';

declare var Packery: any;

@Component({
  selector: '[packery]',
  styleUrls: ['./packery.component.css'],
  template: '<div class="theme-image-grid"></div>' +
    '<div class="theme-image-grid__enlarged-image-backdrop"></div>' +
    '<div class="theme-image-grid__enlarged-image"><img src=""/></div>',
  encapsulation: ViewEncapsulation.None
})
export class PackeryComponent implements OnChanges, AfterViewInit {

  private _images: Array<any> = null;
  private _packery;
  private _imageGridElement; // fixme don't init twice
  private lightbox: LightBox;

  constructor(private elementRef: ElementRef) {
  }

  @Input() set packery(images: Array<any>) {

    this._images = images.slice();
    this._imageGridElement = this.elementRef.nativeElement.querySelector('.theme-image-grid');

    // Init lightbox
    if (this.lightbox) {
      this.lightbox.destroy();
    }
    this.lightbox = new LightBox(
      this._imageGridElement,
      this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image'),
      this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image img'),
      this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image-backdrop')
    );


    while (this._imageGridElement.firstChild) {
      this._imageGridElement.removeChild(this._imageGridElement.firstChild);
    }

    // create images
    this._images.forEach((image: any, index: number) => {
      let imageElement = document.createElement('img');
      imageElement.setAttribute('src', image.sizes.medium_large);
      imageElement.setAttribute('data-src-large', image.sizes.large);
      imageElement.classList.add('theme-image-grid__image');
      if (index === 0) {
        imageElement.classList.add('theme-image-grid__sizer');
      }
      this._imageGridElement.appendChild(imageElement);
      image.element = imageElement;
    });


  }


  safeImageGridShiftLayout() {
    this._packery.shiftLayout();
  }

  safeImageGridFitLayout(element) {
    this._packery.fit(element);
  }

  ngOnChanges() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initPackery();
    }, 1000);
  }

  updateVisibleImages() {
    if (this._packery) {
      document.getElementsByClassName('theme-image-grid')[0].classList.add('theme-image-grid--transitioning-on');
      this._images.forEach((image) => {
        if (image.hidden) {
          image.element.classList.remove('theme-image-grid__image--active');
        } else {
          image.element.classList.add('theme-image-grid__image--active');
        }
      });
      setTimeout((function () {
        this._packery.layout();
      }).bind(this), 200);
    }
  }

  initPackery() {
    this._imageGridElement = this.elementRef.nativeElement.querySelector('.theme-image-grid');
    let transitionDuration = 200;

    if (this._packery) {
      this._packery.destroy();
    }

    // init packery
    this._packery = new Packery(
      this._imageGridElement, {
        itemSelector: '.theme-image-grid__image',
        transitionDuration: transitionDuration + 'ms',
        percentPosition: true,
        hiddenStyle: {opacity: 0},
        visibleStyle: {opacity: 1},
        horizontal: false,
      });
    this.updateVisibleImages();

    // Packery.layoutOnViewChecked = true;
  }

}
