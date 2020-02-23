const MAX_SIZE = 1024;
const MIN_PADDING = 80;

export class LightBox {
  private resetListener = this.clearImageHash.bind(this);
  private clickListener = this.setImageHash.bind(this);
  private hashListener = this.onHashChange.bind(this);
  private activeRect;

  constructor(
    private _imageGridElement: HTMLElement,
    private _enlargedImageElement,
    private _enlargedImageElementImage,
    private _enlargedImageBackdropElement
  ) {
  }

  initialize() {
    this._enlargedImageElement.addEventListener('click', this.resetListener);
    this._enlargedImageBackdropElement.addEventListener('click', this.resetListener);
    this._imageGridElement.addEventListener('click', this.clickListener);
    window.addEventListener('hashchange', this.hashListener);
    this.onHashChange();
  }

  onHashChange() {
    if (location.hash !== '') {
      const url = decodeURIComponent(decodeURIComponent(location.hash.substr(1)));
      const imageElement: HTMLImageElement = <HTMLImageElement>this._imageGridElement.querySelector(`[src*='${url}']`);
      if (imageElement) {
        this.enlargeImage(null, imageElement);
      }
    } else {
      this.reset();
      // history.pushState({}, location.href.split('#')[0]);
    }
  }

  setImageHash(event: UIEvent) {
    const element: HTMLImageElement = <HTMLImageElement>event.target;
    if (!!element.src) {
      location.hash = encodeURIComponent((<HTMLImageElement>event.target).src);
    }
  }

  clearImageHash() {
    history.back()
    this.reset();
  }

  enlargeImage(event: UIEvent, image?: HTMLImageElement) {
    const element: HTMLImageElement = image || <HTMLImageElement>event.target;
    if (!!element.src) {
      this.activeRect = element.getBoundingClientRect();
      const largeImage = element.getAttribute('data-src-large');
      if (largeImage !== element.src) {
        this._enlargedImageElementImage.src = largeImage;
      } else {
        this._enlargedImageElementImage.src = '';
      }
      this._enlargedImageBackdropElement.classList.add('theme-image-grid__enlarged-image-backdrop--visible');
      this._enlargedImageElement.style['z-index'] = '101';
      this._enlargedImageElement.style.backgroundSize = 'cover';
      this._enlargedImageElement.style.backgroundImage = `url('${element.src}')`;
      this._enlargedImageElement.style.transition = 'all 0s';
      ['top', 'left', 'width', 'height'].forEach((key) => {
        this._enlargedImageElement.style[key] = this.activeRect[key] + 'px';
      });
      this._enlargedImageElement.style.transform = 'translate(0, 0)';

      setTimeout(() => {
        if (this.activeRect) {
          if (!!this._enlargedImageElementImage) {
            this._enlargedImageElementImage.style.display = 'block';
          }
          const scale = this.getScale();
          this._enlargedImageElement.style.transition = 'all 800ms ease';
          this._enlargedImageElement.style.top = '50%';
          this._enlargedImageElement.style.left = '50%';
          this._enlargedImageElement.style.transform = 'translate(-50%, -50%)';
          this._enlargedImageElement.style.width = this.activeRect.width * scale + 'px';
          this._enlargedImageElement.style.height = this.activeRect.height * scale + 'px';
        }
      }, 100);
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
    this.activeRect = null;
    this._enlargedImageElement.style = '';
    this._enlargedImageBackdropElement.classList.remove('theme-image-grid__enlarged-image-backdrop--visible');
    this._enlargedImageElementImage.style = '';
  }

  resize() {
    if (this.activeRect) {
      const scale = this.getScale();
      this._enlargedImageElement.style.width = this.activeRect.width * scale + 'px';
      this._enlargedImageElement.style.height = this.activeRect.height * scale + 'px';
    }
  }

  destroy() {
    this._enlargedImageElement.removeEventListener('click', this.resetListener);
    this._enlargedImageBackdropElement.removeEventListener('click', this.resetListener);
    this._imageGridElement.removeEventListener('click', this.clickListener);
    window.removeEventListener('hashchange', this.hashListener);
  }
}
