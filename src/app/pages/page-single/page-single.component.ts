import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef, HostListener
} from '@angular/core';
import { Page } from '../page';
import { PagesService } from '../pages.service';
import { ActivatedRoute, Params } from '@angular/router';
import { MenuService } from '../../menu/menu.service';
import { Menu } from '../../menu/menu';
import { PackeryComponent } from '../../packery/packery.component';
import { LightBox } from '../../common/lightbox';
import { chunkReducer } from '../../common/helpers';

@Component({
  selector: 'app-page-single',
  templateUrl: './page-single.component.html',
  styleUrls: ['./page-single.component.css'],
})
export class PageSingleComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(PackeryComponent) imageGrid: PackeryComponent;
  page: Page;
  menu: Menu = null;
  images: Array<any> = null;
  taggedImages: Array<{ tag_name: string, images: any[] }> = null;
  imagesByFours = [];
  imageRowStyles = [];
  termSlug: string = null;
  fadeInHero = false;
  fadeInPackery = false;
  showBackTopButton = false;

  heroSrc = null;
  private lightbox: LightBox;

  constructor(private pagesService: PagesService,
              private route: ActivatedRoute,
              private menuService: MenuService,
              private elementRef: ElementRef) {
  }

  @HostListener('window:resize', ['$event']) // for window scroll events
  resize(event) {
    if (this.lightbox) {
      this.lightbox.resize();
    }
    if (this.imagesByFours) {
      this.positionImageRows();
    }
  }

  getPage(parentSlug, termSlug?) {
    this.pagesService
      .getPage(parentSlug)
      .subscribe(res => {
        this.page = res[0] as Page;
        console.log('parentSlug', parentSlug);
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
        this.imagesByFours = this.getImagesByFours();
        this.fadeInHero = false;
        this.fadeInPackery = false;
        this.showBackTopButton = false;
        this.heroSrc = null;
        if (this.imagesByFours) {
          this.positionImageRows();
        }
        if (this.lightbox) {
          this.lightbox.destroy();
        }
        setTimeout(() => {
          console.log('init lightbox');
          this.lightbox.initialize();
          // make Wordpress links work in angular
          const links = document.querySelectorAll('.theme-body-text .content a');
          Array.prototype.slice.call(links).forEach(link => {
            const href = link.href;
            if (href.indexOf(window.location.hostname) > -1) {
              link.addEventListener('click', e => {
                e.preventDefault();
                this.menuService.navigateToRouteInURL(href);
              });
            }
          });
        }, 1000);
        const preload = new Image();
        preload.addEventListener('load', () => {
          this.heroSrc = preload.src;
        });
        preload.src = this.page.acf.hero_image.url;
        setTimeout(() => {
          console.log('fade in hero')
          this.fadeInHero = true;
          this.fadeInPackery = true;
          this.showBackTopButton = true;
        }, 2000);
        if (this.taggedImages && termSlug !== undefined) {
          this.filterGallery(termSlug);
        }
      });

  }

  ngOnInit() {

    this.route.params.forEach((params: Params) => {

      let parent = params['parent'];
      let slug = params['slug'];

      // if the parent is 'explore' then show the explore page...
      if (parent === 'explore') {
        console.log({slug, page: this.page});

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

  ngAfterViewInit(): void {
    // Init lightbox
    if (this.lightbox) {
      this.lightbox.destroy();
    }
    this.lightbox = new LightBox(
      this.elementRef.nativeElement.querySelector('.image-grids'),
      this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image'),
      this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image img'),
      this.elementRef.nativeElement.querySelector('.theme-image-grid__enlarged-image-backdrop')
    );
  }

  ngOnDestroy() {
    this.fadeInHero = false;
  }

  scrollToTop() {
    document.documentElement.classList.toggle('scrolling', true);
    document.documentElement.scrollTop = 0;
    document.documentElement.classList.toggle('scrolling', false);
  }

  filterGallery(termSlug: string) {
    this.termSlug = termSlug;
    if (this.taggedImages) {
      if (termSlug === 'all') {
        this.images.forEach((image) => {
          image.hidden = true;
        });
      } else {
        this.taggedImages.forEach((taggedGallery) => {
          taggedGallery.images.forEach((image: any, i: number) => {
            image.hidden = taggedGallery.tag_name !== this.termSlug;
          });
        });
      }
      if (this.imageGrid) {
        this.imageGrid.updateVisibleImages();
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
      }, 0) + 'px';
      styles.row.margin = '0 auto';
    });
  }
}

