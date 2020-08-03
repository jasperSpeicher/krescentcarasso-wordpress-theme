import { ViewEncapsulation, Component, Input, ElementRef, OnChanges, AfterViewInit, OnDestroy } from '@angular/core';
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
export class PackeryComponent implements OnChanges, AfterViewInit, OnDestroy {

  private _images: Array<any> = null;
  private _packery;
  private _imageGridElement; // fixme don't init twice
  private lightbox: LightBox;
  private clippingInterval;
  private gridBottom: number;

  constructor(private elementRef: ElementRef) {
  }

  setImageBackground(backgroundImageElement: HTMLDivElement, url) {
    let color = (Math.random() * 0.3 + 0.7) * 250;
    backgroundImageElement.setAttribute(
      'style',
      `background-image: url(${url}); background-color: rgb(${color},${color},${color});`
    );
  }

  @Input() set packery(images: Array<any>) {

    this._images = images.slice();
    this._images.sort(function () {
      return 0.5 - Math.random();
    });
    this._imageGridElement = this.elementRef.nativeElement.querySelector('.theme-image-grid');

    // Init lightbox
    // TODO make this more angular
    if (this.lightbox) {
      this.lightbox.destroy();
    } else {
      this.lightbox = new LightBox(
        this._imageGridElement,
        this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image'),
        this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image img'),
        this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image-backdrop'),
        'theme-image-grid__image--active'
      );
    }
    this.lightbox.initialize();

    while (this._imageGridElement.firstChild) {
      this._imageGridElement.removeChild(this._imageGridElement.firstChild);
    }

    // create images
    this._images.forEach((image: any, index: number) => {
      const imageElement = document.createElement('div');
      const backgroundImageElement = document.createElement('div');
      const activeBackgroundImageElement = document.createElement('div');
      activeBackgroundImageElement.className = 'theme-image-grid__active-image';
      this.setImageBackground(backgroundImageElement, image.sizes.thumbnail);
      this.setImageBackground(activeBackgroundImageElement, image.sizes.thumbnail);
      imageElement.setAttribute('data-src-large', image.sizes.large);
      imageElement.setAttribute('data-src', image.sizes.thumbnail);
      imageElement.classList.add('theme-image-grid__image');
      if (image.height > image.width) {
        imageElement.classList.add('theme-image-grid__image--portrait');
      }
      imageElement.appendChild(backgroundImageElement);
      imageElement.appendChild(activeBackgroundImageElement);
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

  ngOnDestroy() {
    if (this.lightbox) {
      this.lightbox.destroy();
      this.lightbox = null;
    }
  }

  updateVisibleImages() {
    if (this._packery) {
      const gridElement = document.getElementsByClassName('theme-image-grid')[0];
      gridElement.classList.toggle('theme-image-grid--transitioning-on', true);
      this._images.forEach((image) => {
        if (image.hidden) {
          image.element.classList.remove('theme-image-grid__image--active');
          this.setImageBackground(image.element.childNodes[0], image.sizes.thumbnail);
          this.setImageBackground(image.element.childNodes[1], image.sizes.thumbnail);
        } else {
          image.element.classList.add('theme-image-grid__image--active');
          this.setImageBackground(image.element.childNodes[0], image.sizes.medium_large);
          this.setImageBackground(image.element.childNodes[1], image.sizes.medium_large);
        }
      });
      setTimeout((function () {
        this._packery.shuffle();
        this._packery.layout();
        gridElement.classList.toggle('theme-image-grid--transitioning-on', false);
      }).bind(this), 0); // this should exceed image width and padding-top time in css

      if (this.clippingInterval) {
        clearInterval(this.clippingInterval);
        this.clippingInterval = null;
      }
      this.clippingInterval = setInterval((function () {
        console.log('clipping');
        const activeImages = Array.prototype.slice.apply(
          document.getElementsByClassName('theme-image-grid__image--active'));
        if (!activeImages.length) {
          if (!!this.clippingInterval) {
            clearInterval(this.clippingInterval);
          }
          return;
        }
        const gridBottom = activeImages.reduce((yMax, image) => {
          const bottom = image.offsetTop + image.offsetHeight;
          return Math.max(yMax, bottom);
        }, 0);
        if (this.gridBottom === gridBottom && !!this.clippingInterval) {
          clearInterval(this.clippingInterval);
          this.clippingInterval = null;
        }
        this.gridBottom = gridBottom;
        gridElement.setAttribute('style', `height:${gridBottom}px;`);
        // this._images.forEach((image) => {
        //   image.element.classList.toggle('theme-image-grid__image--clipped', image.offsetTop > gridBottom);
        //   });
      }).bind(this), 1000);

    }
  }

  initPackery() {
    this._imageGridElement = this.elementRef.nativeElement.querySelector('.theme-image-grid');
    let transitionDuration = 100;

    if (this._packery) {
      this._packery.destroy();
    }

    // add shuffler
    Packery.prototype.shuffle = function () {
      const stride = parseInt(`${Math.random() * 15 + 6}`, 10);
      const start = parseInt(`${stride / 2}`, 10);
      const activeItems = this.items.filter(item => item.element.classList.contains('theme-image-grid__image--active'));
      const inactiveItems = this.items.filter(item => !item.element.classList.contains('theme-image-grid__image--active'));
      let cursor = 0;
      this.items = [];
      while (!!activeItems.length || !!inactiveItems.length) {
        if (cursor++ % stride === start) {
          if (!!activeItems.length) {
            this.items.push(activeItems.pop());
          }
        } else {
          if (!!inactiveItems.length) {
            this.items.push(inactiveItems.pop());
          }
        }
      }
      this.items.forEach((item, index) => {
        item.element.childNodes[0].setAttribute(
          'data-index',
          `${index}`
        );
      });
    };
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
