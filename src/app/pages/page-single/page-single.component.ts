import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef, HostListener, AfterViewChecked
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Page } from '../page';
import { PagesService } from '../pages.service';
import { ActivatedRoute, Params } from '@angular/router';
import { MenuService } from '../../menu/menu.service';
import { Menu } from '../../menu/menu';
import { PackeryComponent } from '../../packery/packery.component';
import { LightBox } from '../../common/lightbox';
import { chunkReducer } from '../../common/helpers';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-page-single',
  templateUrl: './page-single.component.html',
  styleUrls: ['./page-single.component.css'],
})
export class PageSingleComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  @ViewChild(PackeryComponent) packeryComponent: PackeryComponent;
  page: Page;
  menu: Menu = null;
  images: Array<any> = null;
  taggedImages: Array<{ tag_name: string, images: any[] }> = null;
  imagesByFours = [];
  imageRowStyles = [];
  imageGridHeight = 0;
  termSlug: string = null;
  fadeInHero = false;
  fadeInPackery = false;
  showBackTopButton = false;
  resizeTimeout;
  contactForm: HTMLFormElement;
  contactFormId: string;
  contactFormErrorMessage: string;
  contactFormData: FormData;
  subscription = new Subscription();

  heroSrc = null;
  altHeroSrc = null;
  public lightbox: LightBox;

  constructor(private pagesService: PagesService,
              private route: ActivatedRoute,
              private menuService: MenuService,
              private elementRef: ElementRef,
              private sanitizer: DomSanitizer) {
  }

  @HostListener('window:resize', ['$event']) // for window scroll events
  resize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      if (this.lightbox) {
        this.lightbox.resize();
      }
      if (this.imagesByFours) {
        this.positionImageRows();
      }
    }, 1000);
  }

  get sanitizedContent() {
    return this.sanitizer.bypassSecurityTrustHtml(this.page.content.rendered);
  }

  get showPackery() {
    return !!this.page && !!this.page.acf && this.page.acf.grid_type === 'columns';
  }

  get showImageRows() {
    return !!this.page &&
      !!this.imagesByFours &&
      this.imagesByFours.length > 0 &&
      !!this.imageRowStyles &&
      this.imageRowStyles.length > 0 &&
      this.page.acf.grid_type === 'rows';
  }

  getContactFormId(content: string) {
    const match = content.match(/id="wpcf7-f([^-]+)-\S+"/);
    return match ? match[1] : null;
  }

  getPage(parentSlug, termSlug?) {
    this.pagesService
      .getPage(parentSlug)
      .subscribe(res => {
        if (!res[0]) {
          return;
        }
        this.page = res[0] as Page;
        this.taggedImages = this.page.acf.tagged_gallery;
        this.images = this.taggedImages ?
          this.taggedImages
            .reduce(
              (images, taggedGallery) => {
                return images.concat(taggedGallery.images);
              }, [])
          : this.page.acf.gallery;
        if (!!this.taggedImages) {
          const fillerImages = this.page.acf.gallery
            .filter((fillerImage) => this.images.findIndex(tagged => fillerImage.id === tagged.id) === -1);
          this.images = this.images
            .concat(fillerImages)
            .concat(fillerImages.slice(0, fillerImages.length / 2));
        }
        this.imageGridHeight = 0;
        this.imagesByFours = !this.showPackery ? this.getImagesByFours() : null;
        this.fadeInHero = false;
        this.fadeInPackery = false;
        this.showBackTopButton = false;
        this.heroSrc = null;
        if (this.imagesByFours) {
          this.positionImageRows();
        }
        setTimeout(() => {
          this.contactFormId = this.getContactFormId(this.page.content.rendered);
          this.contactFormErrorMessage = null;
        }, 1000);
        const preload = new Image();
        preload.addEventListener('load', () => {
          this.heroSrc = preload.src;
        });
        preload.src = this.page.acf.hero_image.url;
        this.altHeroSrc = this.page.slug === 'about' ? this.page.acf.grid_image.sizes.medium_large : null;
        setTimeout(() => {
          this.fadeInHero = true;
          this.fadeInPackery = true;
          this.showBackTopButton = true;
        }, 2000);
        if (this.taggedImages) {
          this.filterGallery(termSlug);
        }
        this.scrollToTop();
      });

  }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {

      let parent = params['parent'];
      let slug = params['slug'];

      // if the parent is 'explore' then show the explore page...
      if (parent === 'explore') {
        if (!this.page || this.page.slug !== 'explore') {
          this.page = null;
          this.getPage('explore', slug);
        } else {
          if (slug !== undefined) {
            this.filterGallery(slug);
          }
        }
      } else {
        // otherwise just show the page
        if (!!slug) {
          this.page = null;
          this.getPage(slug);
        } else {
          this.page = null;
          this.getPage(this.route.snapshot.url[0].path);
        }
      }

    });
  }

  async createLightbox() {
    if (!this.lightbox) {
      const menu = await this.menuService.getMenuObservable().toPromise();
      const gridSelector = menu.slug === 'projects' ? '.theme-collection__lightbox-area' : '.image-grids';
      const gridElement = this.elementRef.nativeElement.querySelectorAll(gridSelector);
      this.lightbox = new LightBox(
        gridElement[gridElement.length - 1],
        this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image'),
        this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image img'),
        this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image-backdrop'),
        this.elementRef.nativeElement.querySelector('.theme-image-grid__lightbox-previous'),
        this.elementRef.nativeElement.querySelector('.theme-image-grid__lightbox-next'),
      );
    }
    this.subscription.add(
      this.menuService.getMenuObservable().subscribe((menu) => {
        this.subscription.add(menu.getActiveParentObservable().subscribe((activeParent) => {
          this.lightbox.setClassName(menu.slug === 'explore' ? 'theme-image-grid__image--active' : null);
          let images;
          if (menu.slug === 'collections' || menu.slug === 'projects') {
            images = this.images;
          }
          if (menu.slug === 'explore') {
            images = this.images.filter(i => !i.hidden);
          }
          const imageSet = !!images && images
            .filter(i => !i.hidden)
            .map(i => ({
              src: i.url,
              width: i.width,
              height: i.height,
            }));
          if (imageSet) {
            this.lightbox.setImageSet(imageSet);
          }
        }));
      }));
  }

  ngAfterViewInit(): void {
    this.createLightbox();
    // Init lightbox
    // if (this.images) {
    //   this.createLightbox();
    // }
  }


  ngOnDestroy() {
    this.fadeInHero = false;
    if (this.lightbox) {
      this.lightbox.destroy();
      this.lightbox = null;
    }
    this.subscription.unsubscribe();
  }

  scrollToTop() {
    document.documentElement.classList.toggle('scrolling', true);
    document.documentElement.scrollTop = 0;
    document.documentElement.classList.toggle('scrolling', false);
  }

  filterGallery(termSlug: string) {
    this.termSlug = termSlug;
    if (this.taggedImages) {
      this.images.forEach((image) => {
        image.hidden = true;
      });
      this.taggedImages.forEach((taggedGallery) => {
        taggedGallery.images.forEach((image: any, i: number) => {
          image.hidden = taggedGallery.tag_name !== this.termSlug;
        });
      });
      if (this.packeryComponent) {
        this.packeryComponent.updateVisibleImages();
      }
    }
  }

  getImagesByFours() {
    return this.images ? this.images.reduce(chunkReducer(4), [[]]) : [];
  }

  positionImageRows() {
    const padding = window.innerWidth > 768 ? 10 : 0;
    const minRatioDivisor = 3;
    this.imageRowStyles = [];
    this.imagesByFours.forEach((rowImages: any[]) => {
      let rowWidth = document.querySelector('.image-grids').clientWidth;
      let heights = [];
      let widths = [];
      let styles: any = {images: [], row: {}};
      this.imageRowStyles.push(styles);
      rowImages.forEach((image: any, i) => {
        widths[i] = image.width;
        heights[i] = image.height;
      });
      let imagesWidth = widths.reduce(
        (sum, w, i) => {
          return sum + (w / (heights[i]));
        }, 0);
      let ratio = (rowWidth - (rowImages.length - 1) * padding) / imagesWidth;
      ratio = Math.min(ratio, rowWidth / minRatioDivisor);
      rowImages.forEach((image: any, i) => {
        let imageStyles: any = {};
        imageStyles.width = ratio * widths[i] / heights[i] + 'px';
        imageStyles.left = widths.slice(0, i).reduce(function (sum, w, j) {
          return sum + (padding + ratio * widths[j] / heights[j]);
        }, 0) + 'px';
        imageStyles.height = ratio + 'px';
        styles.images.push(imageStyles);
      });
      styles.row.height = padding + ratio + 'px';
      styles.row.width = widths.reduce(function (sum, w, j) {
        return sum + (padding + ratio * widths[j] / heights[j]);
      }, 0) - padding + 'px';
      styles.row.margin = '0 auto';
    });
    this.imageGridHeight = this.imageRowStyles.reduce((sum, row) => {
      return sum + parseInt(row.height, 10);
    }, 0);
  }

  ngAfterViewChecked() {
    if (this.lightbox && !this.lightbox.initialized) {
      this.lightbox.initialize();
    }
    // make Wordpress links work in angular
    const links = document.querySelectorAll('.theme-body-text .content a');
    Array.prototype.slice.call(links).forEach(link => {
      const href = link.href;
      if (href.indexOf(window.location.hostname) > -1) {
        link.onclick = e => {
          e.preventDefault();
          this.menuService.navigateToRouteInURL(href);
        };
      }
    });
    if (!!this.contactFormId) {
      this.contactForm = this.elementRef.nativeElement.querySelector('form');
      this.contactForm.action = null;
      if (this.contactFormData) {
        for (let i = 0; i < this.contactForm.elements.length; i++) {
          const type = this.contactForm[i].getAttribute('type');
          if (type !== 'submit') {
            const fieldValue = this.contactFormData.get(this.contactForm[i].name);
            this.contactForm[i].value = fieldValue;
          }
        }
      }
      if (!this.contactForm.onsubmit) {
        this.contactForm
          .onsubmit = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.contactFormData = new FormData((this.contactForm));
          this.pagesService.submitContactForm(this.contactFormData, this.contactFormId)
            .then((responseBody) => {
              this.scrollToTop();
              if (responseBody.status === 'validation_failed') {
                this.contactFormErrorMessage = responseBody.message;
              }
              if (responseBody.status === 'mail_sent') {
                this.contactFormId = null;
                this.contactFormErrorMessage = 'Your message has been sent. Thank you for getting in touch.';
              }
            });
        };
      }
    }
  }
}

