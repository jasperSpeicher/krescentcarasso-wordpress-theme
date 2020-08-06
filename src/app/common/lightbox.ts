const MAX_SIZE = 1024;
const MIN_PADDING = 80;

export class LightBox {
  private listeners = [];
  private activeRect;
  private initialized = false;
  private imageSet: { width: number, height: number, src: string }[] = [];
  private currentSetIndex = 0;
  private _previousButton: HTMLElement;
  private _nextButton: HTMLElement;

  constructor(
    private _imageGridElement: HTMLElement,
    private _enlargedImageElement: HTMLDivElement,
    private _enlargedImageElementImage: HTMLImageElement,
    private _enlargedImageBackdropElement: HTMLElement,
    private className: string,
  ) {}

  addEventListener(element: HTMLElement | Window, event: string, listener: EventListenerObject) {
    this.listeners.push({element, listener});
    element.addEventListener(event, listener);
  }

  initialize() {
    if (!this.initialized) {
      this._previousButton = <HTMLElement>document.querySelector('.theme-image-grid__lightbox-previous');
      this._nextButton = <HTMLElement>document.querySelector('.theme-image-grid__lightbox-next');
      this.addEventListener(this._enlargedImageElement, 'click', this.onReset.bind(this));
      this.addEventListener(this._enlargedImageBackdropElement, 'click', this.onReset.bind(this));
      this.addEventListener(this._imageGridElement, 'click', this.onClick.bind(this));
      this.addEventListener(this._nextButton, 'click', this.showNext.bind(this));
      this.addEventListener(this._previousButton, 'click', this.showPrevious.bind(this));
      this.addEventListener(window, 'hashchange', this.onHashChange.bind(this));
      this.onHashChange();
    }
  }

  setImageSet(sources: { src: string, width: number, height: number }[]) {
    console.log({sources});
    this.imageSet = sources;
  }

  get nextImageIndex() {
    return (this.currentSetIndex + 1) % this.imageSet.length;
  }

  get previousImageIndex() {
    return (this.currentSetIndex - 1 + this.imageSet.length) % this.imageSet.length;
  }

  get imageSetEnabled() {
    return this.currentSetIndex >= 0;
  }

  setImage(imageData: { width: number, height: number, src: string }) {
    console.log(imageData);
    this._enlargedImageElementImage.src = imageData.src;
    this._enlargedImageElement.style.backgroundImage = `url('${imageData.src}')`;
    this.activeRect = imageData;
    this.toggleDimensionTransitions(false);
    this.resize();
  }

  showNext(e) {
    e.stopImmediatePropagation();
    this.currentSetIndex = this.nextImageIndex;
    this.setImage(this.imageSet[this.currentSetIndex]);
  }

  showPrevious(e) {
    e.stopImmediatePropagation();
    this.currentSetIndex = this.previousImageIndex;
    this.setImage(this.imageSet[this.currentSetIndex]);
  }

  onHashChange() {
    if (location.hash !== '') {
      const url = decodeURIComponent(decodeURIComponent(location.hash.substr(1)));
      const matchingImages = Array.prototype.slice.call(
        <NodeListOf<HTMLDivElement>>this._imageGridElement
          .querySelectorAll(`[data-src-large*='${url}']${this.className ? '.' + this.className : ''}`)
      );
      const imageElement: HTMLDivElement =
        matchingImages.find(i => i.classList.contains('theme-image-grid__image--active')) ||
        matchingImages[0];
      if (imageElement) {
        this.enlargeImage(null, imageElement);
      }
    } else {
      this.reset();
      // history.pushState({}, location.href.split('#')[0]);
    }
  }

  onClick(event: UIEvent) {
    const element: HTMLElement = <HTMLImageElement>event.target;
    const src = element.parentElement.getAttribute('data-src-large');
    const clickable = this.className ? element.parentElement.classList.contains(this.className) : true;
    if (!!src && clickable) {
      location.hash = encodeURIComponent(src);
    }
  }

  onReset() {
    history.replaceState(null, null, window.location.href.split('#')[0]);
    this.reset();
  }

  enlargeImage(event: UIEvent, image?: HTMLDivElement) {
    const element: HTMLDivElement = image || <HTMLDivElement>event.target;
    // if we are in explore, class contains theme-image-grid__image--active  and
    // the image src is in the data-src-large attribute
    const src = element.classList.contains('theme-image-grid__image--active') ?
      element.getAttribute('data-src-large') :
      element.getAttribute('data-src');
    if (!!src) {
      this.activeRect = element.getBoundingClientRect();
      const largeImage = element.getAttribute('data-src-large');
      // if (largeImage !== src) {
      this._enlargedImageElementImage.src = largeImage;
      // } else {
      //   this._enlargedImageElementImage.src = '';
      // }
      this.currentSetIndex = this.imageSet.findIndex((i: { src: string }) => i.src === this._enlargedImageElementImage.src);
      this._enlargedImageBackdropElement.classList.add('theme-image-grid__enlarged-image-backdrop--visible');
      this._enlargedImageElement.style['z-index'] = '101';
      this._enlargedImageElement.style.backgroundSize = 'cover';
      this._enlargedImageElement.style.backgroundImage = `url('${src}')`;
      this._enlargedImageElement.style.transition = 'all 0s';
      ['top', 'left', 'width', 'height'].forEach((key) => {
        this._enlargedImageElement.style[key] = this.activeRect[key] + 'px';
      });

      setTimeout(() => {
        if (this.activeRect) {
          if (!!this._enlargedImageElementImage) {
            this._enlargedImageElementImage.style.display = 'block';
          }
          this.toggleDimensionTransitions(true);
          this._enlargedImageElement.style.transition = 'top 800ms, left 800ms, width 800ms, height 800ms';
          this.resize();
        }
      }, 100);
    }
  }

  toggleDimensionTransitions(state) {
    if (state) {
      this._enlargedImageElement.style.transition = 'top 800ms, left 800ms, width 800ms, height 800ms';
    } else {
      this._enlargedImageElement.style.transition = '';
    }
  }

  getScale() {
    if (this.activeRect) {
      let scale = (window.innerHeight - MIN_PADDING) / this.activeRect.height;
      const maxWidth = Math.min(MAX_SIZE, window.innerWidth - MIN_PADDING);
      const maxHeight = Math.min(MAX_SIZE, window.innerHeight - MIN_PADDING);
      if (scale * this.activeRect.width > maxWidth) {
        scale = maxWidth / this.activeRect.width;
      }
      if (scale * this.activeRect.height > maxHeight) {
        scale = maxHeight / this.activeRect.height;
      }
      return scale;
    }
    return null;
  }

  reset() {
    this.toggleDimensionTransitions(true);
    this.activeRect = null;
    this._enlargedImageElement.setAttribute('style', '');
    this._enlargedImageBackdropElement.classList.remove('theme-image-grid__enlarged-image-backdrop--visible');
    this._enlargedImageElementImage.setAttribute('style', '');
  }

  resize() {
    if (this.activeRect) {
      const scale = this.getScale();
      const width = this.activeRect.width * scale;
      const height = this.activeRect.height * scale;
      this._enlargedImageElement.style.width = width + 'px';
      this._enlargedImageElement.style.height = height + 'px';
      this._enlargedImageElement.style.top = (window.innerHeight - height) / 2 + 'px';
      this._enlargedImageElement.style.left = (window.innerWidth - width) / 2 + 'px';
    }
  }

  destroy() {
    this.listeners.forEach(l => l.element.removeEventListener(l.event, l.listener));
    this.initialized = false;
  }
}
