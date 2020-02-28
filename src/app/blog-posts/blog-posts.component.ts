import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, VirtualTimeScheduler } from 'rxjs';
import { BlogPostService } from '../services/blog-post.service';
import { BlogPost } from '../models/blogpost';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-blog-posts',
  templateUrl: './blog-posts.component.html',
  styleUrls: ['./blog-posts.component.css']
})
export class BlogPostsComponent implements OnInit {

  displayedColumns: string[] = ['postId', 'title', 'body', 'creator', 'dt', 'edit-action', 'delete-action'];
  dataSource: MatTableDataSource<BlogPost>;
  blogPosts$: Observable<BlogPost[]>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private blogPostService: BlogPostService) {
    const blogPosts = this.blogPostService.getBlogPosts();
    console.log(blogPosts);
    blogPosts.subscribe(value => {
      console.log(value);
      this.dataSource = new MatTableDataSource(value);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });


    // console.log(this.dataSource);
  }

  ngOnInit() {
    // this.loadBlogPosts();
    // this.dataSource.paginator = this.paginator;
  }

  loadBlogPosts() {
    // this.blogPosts$ = this.blogPostService.getBlogPosts();
    const blogPosts = this.blogPostService.getBlogPosts();
    console.log(blogPosts);
    blogPosts.subscribe(value => {
      console.log(value);
      this.dataSource = new MatTableDataSource(value);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  delete(postId) {
    const ans = confirm('Do you want to delete blog post with id: ' + postId);
    if (ans) {
      this.blogPostService.deleteBlogPost(postId).subscribe((data) => {
        this.loadBlogPosts();
      });
    }
  }
}