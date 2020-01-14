import { ViewEncapsulation, Component, Input, ElementRef, AfterContentInit, OnChanges, AfterViewInit } from '@angular/core';

declare var Packery: any;

@Component({
  selector: '[packery]',
  styleUrls: ['./packery.component.css'],
  template: '<div class="theme-image-grid"></div><div class="theme-image-grid__enlarged-image-backdrop"></div><div class="theme-image-grid__enlarged-image"><img src=""/></div>',
  encapsulation: ViewEncapsulation.None
})
export class PackeryComponent implements OnChanges, AfterViewInit {

  private _images: Array<any> = null;
  private _packery;
  private _imageGridElement; // fixme don't init twice
  private _enlargedImageElement;
  private _enlargedImageElementImage;
  private _enlargedImageBackdropElement;

  constructor(private elementRef: ElementRef) {
  }

  @Input() set packery(images: Array<any>) {

    this._images = images.slice();
    this._imageGridElement = this.elementRef.nativeElement.querySelector('.theme-image-grid');
    this._enlargedImageElement = this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image');
    this._enlargedImageElementImage = this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image img');
    this._enlargedImageBackdropElement = this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image-backdrop');

    while (this._imageGridElement.firstChild) {
      this._imageGridElement.removeChild(this._imageGridElement.firstChild);
    }

    //create images
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
          if (!image.removed) {
            this._packery.remove(image.element);
            image.removed = true;
            this.safeImageGridShiftLayout();
          }
        } else {
          if (image.removed) {
            this._imageGridElement.insertBefore(image.element, this._imageGridElement.firstChild);
            this._packery.prepended(image.element);
            image.removed = false;
          }
        }
      });
    }
  }

  initPackery() {
    this._imageGridElement = this.elementRef.nativeElement.querySelector('.theme-image-grid');
    let transitionDuration = 800;

    this._packery && this._packery.destroy();

    //init packery
    this._packery = new Packery(
      this._imageGridElement, {
        itemSelector: '.theme-image-grid__image',
        transitionDuration: transitionDuration + 'ms',
        percentPosition: true,
        hiddenStyle: {opacity: 0},
        visibleStyle: {opacity: 1}
      });
    this._packery.layout();
    this.updateVisibleImages();

    //Packery.layoutOnViewChecked = true;

    let _self = this;
    this._imageGridElement.addEventListener('click', (event: any) => {
      const rect = event.target.getBoundingClientRect();
      setTimeout(() => {
        this._enlargedImageBackdropElement.style['display'] = 'block';
        this._enlargedImageElement.style['z-index'] = '101';
        this._enlargedImageElement.style.backgroundSize = 'cover';
        this._enlargedImageElement.style.backgroundImage = `url('${event.target.src}')`;
        this._enlargedImageElementImage.setAttribute('src', event.target.getAttribute('data-src-large'));
        this._enlargedImageElementImage.style.display = 'block';
        this._enlargedImageElement.style.transition = 'all 0s';
        ['top', 'left', 'width', 'height'].forEach((key) => {
          this._enlargedImageElement.style[key] = rect[key] + 'px';
        });
      }, 0);
      setTimeout(() => {
        this._enlargedImageElement.style.transition = 'all 800ms ease';
        const scale = (window.innerHeight - 80) / rect.height;
        this._enlargedImageElement.style.top = '40px';
        this._enlargedImageElement.style.left = (window.innerWidth / 2 - rect.width * scale / 2) + 'px';
        this._enlargedImageElement.style.width = rect.width * scale + 'px';
        this._enlargedImageElement.style.height = rect.height * scale + 'px';
      }, 100);
    });
    const reset = (event: any) => {
      this._enlargedImageElement.style = '';
      this._enlargedImageBackdropElement.style = '';
      this._enlargedImageElementImage.style = '';
    };
    this._enlargedImageElement.addEventListener('click', reset);
    this._enlargedImageBackdropElement.addEventListener('click', reset);
  }

}
