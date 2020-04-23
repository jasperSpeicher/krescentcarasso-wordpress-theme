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
import { Observable } from 'rxjs/Observable';
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
  imagesByFours = null;
  imageRowStyles = [];
  termSlug: string = null;
  mediaObjects: any = null;
  fadeInHero = false;
  heroSrc = null;
  private lightbox: LightBox;

  scrollPos = 0;

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
        this.images = this.page.acf.gallery;
        this.imagesByFours = this.getImagesByFours();
        this.fadeInHero = false;
        this.heroSrc = null;
        if (this.imagesByFours) {
          this.positionImageRows();
        }
        if (this.lightbox) {
          this.lightbox.destroy();
        }
        setTimeout(() => {
          console.log('init lightbox')
          this.lightbox.initialize();
        }, 1000);
        const preload = new Image();
        preload.addEventListener('load', () => {
          this.heroSrc = preload.src;
        });
        preload.src = this.page.acf.hero_image.url;
        setTimeout(() => {
          console.log('fade in hero')
          this.fadeInHero = true;
        }, 2000);
        if (this.images) {
          this.populateMediaCategoryTerms().subscribe(() => {
            // ...and use the slug for the media category
            if (termSlug !== undefined) {
              this.filterGallery(termSlug);
            }
          });
        }
      });

  }

  populateMediaCategoryTerms(): Observable<any> {
    //FIXME what about when this is still loading?

    const imagesById = {};
    this.images.forEach((image: any) => {
      imagesById[image.id] = image;
    });
    const obs: Observable<any> = this.pagesService.getMediaObjects()
      .map(objects => {

        this.mediaObjects = objects;
        objects.forEach((object) => {
          if (imagesById[object.id]) {
            imagesById[object.id].mediaCategoryTerms = object['media_category_terms']
              .map((term: any) => term.slug);
          }
        });
      });
    return obs;
  }

  ngOnInit() {

    this.route.params.forEach((params: Params) => {

      let parent = params['parent'];
      let slug = params['slug'];

      // if the parent is 'explore' then show the explore page...
      if (parent === 'explore') {
        if (!this.page || this.page.parent !== 'explore') {
          this.page = null;
          this.getPage('explore', slug);
        } else {
          if (slug !== undefined) {
            this.filterGallery(slug);
          }
        }
      } else {
        // otherwise just show the page
        if (slug !== undefined) {
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

  filterGallery(termSlug: string) {
    this.termSlug = termSlug;
    if (this.images) {
      if (termSlug === 'all') {
        this.images.forEach((image: any) => {
          image.hidden = false;
        });
      } else {
        this.images.forEach((image: any, i: number) => {
          //image.hidden = image.mediaCategoryTerms ? image.mediaCategoryTerms.indexOf(this.termSlug) < 0 : true;
          image.hidden = Math.random() > 0.5;
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
    const padding = window.innerWidth > 768 ? 20 : 0;
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

