import { ViewEncapsulation, Component, Input, ElementRef, AfterContentInit, OnChanges, AfterViewInit } from '@angular/core';
declare var Packery:any;

@Component({
  selector: '[packery]',
  styleUrls: ['./packery.component.css'],
  template: '<div class="theme-image-grid"></div>',
  encapsulation: ViewEncapsulation.None
})
export class PackeryComponent implements OnChanges, AfterViewInit {

  private _images:Array<any> = null;
  private _packery;
  private _imageGridElement; //fixme don't init twice

  constructor(private elementRef:ElementRef) {
  }

  @Input() set packery(images:Array<any>) {

    this._images = images.slice();
    this._imageGridElement = this.elementRef.nativeElement.querySelector('.theme-image-grid');

    while (this._imageGridElement.firstChild) {
      this._imageGridElement.removeChild(this._imageGridElement.firstChild);
    }

    //create images
    this._images.forEach((image:any, index:number)=> {
      let imageElement = document.createElement('img');
      imageElement.setAttribute('src', image.sizes.medium_large);
      imageElement.classList.add('theme-image-grid__image')
      if (index == 0) {
        imageElement.classList.add('theme-image-grid__sizer')
      }
      this._imageGridElement.appendChild(imageElement);
      image.element = imageElement;
    });


  }


  safeImageGridShiftLayout() {
    console.log('safe imageGrid shift layout');
    this._packery.shiftLayout();
  }

  safeImageGridFitLayout(element) {
    console.log('safe imageGrid fit layout');
    this._packery.fit(element);
  }

  ngOnChanges() {
    console.log('images changed in packery')
  }

  ngAfterViewInit() {
    setTimeout(()=> {
      this.initPackery();
    }, 1000);
  }

  updateVisibleImages() {
    if (this._packery) {
      document.getElementsByClassName('theme-image-grid')[0].classList.add('theme-image-grid--transitioning-on');
      this._images.forEach((image)=> {
        if (image.hidden) {
          if (!image.removed) {
            image.element.classList.remove('theme-image-grid__image--large');
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
    console.log('init packery');
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

    //zoom images on click
    let _self = this;
    this._imageGridElement.addEventListener('click', function (event:any) {
      var isLarge = event.target.classList.contains('theme-image-grid__image--large');
      // filter for grid-item clicks
      if (!event.target.classList.contains('theme-image-grid__image')) {
        return;
      }
      document.getElementsByClassName('theme-image-grid')[0].classList.add('theme-image-grid--transitioning-on');
      let largeImages = [].slice.call(
        document.getElementsByClassName('theme-image-grid__image--large')
      );
      for (let largeImage of largeImages as any[]) {
        //return any large images to original size before zooming current image
        largeImage.classList.remove('theme-image-grid__image--large');
      }
      _self.safeImageGridShiftLayout();
      if (!isLarge) {
        setTimeout(()=> {
          event.target.classList.toggle('theme-image-grid__image--large');
          _self.safeImageGridFitLayout(event.target);
        }, transitionDuration / 4);
      }
    });

  }

}
