import { Injectable, Logger } from '@nestjs/common';
import { PostsService, GetPostsFilters } from '../posts/posts.service';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly postsService: PostsService) {}

  /**
   * Generates CSV string for filtered posts
   */
  async exportToCsv(filters: GetPostsFilters): Promise<string> {
    this.logger.log('Generating CSV export...');
    
    // Fetch all matching records without pagination limits
    const postsResult = await this.postsService.getPosts({
      ...filters,
      page: 1,
      limit: 1000 // Upper limit for safety
    });

    const posts = postsResult.data;

    const headers = [
      'ID', 'Platform', 'Author', 'Handle', 'Date Created',
      'Original Content', 'Translated Content', 'AI Summary',
      'Category', 'Sentiment', 'Language', 'Engagement',
      'Source URL', 'Region', 'Is Spam'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = posts.map(post => [
      post.id,
      post.platform,
      post.author,
      post.handle,
      post.created_at instanceof Date ? post.created_at.toISOString() : new Date(post.created_at).toISOString(),
      post.content,
      post.translated_content || '',
      post.summary || '',
      post.category || '',
      post.sentiment || '',
      post.language || '',
      post.engagement_score,
      post.source_url,
      post.region || '',
      post.is_gibberish ? 'TRUE' : 'FALSE'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');
  }

  /**
   * Generates PDF stream and writes to Express response
   */
  async exportToPdf(filters: GetPostsFilters, res: Response): Promise<void> {
    this.logger.log('Generating PDF report...');
    
    const postsResult = await this.postsService.getPosts({
      ...filters,
      page: 1,
      limit: 150 // Limit pdf size for presentation layout
    });

    const posts = postsResult.data;

    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=social_scraper_report.pdf');

    doc.pipe(res);

    // Title Page Header
    doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold').text('Social Media Scraper Report', { align: 'center' });
    doc.fontSize(12).font('Helvetica-Oblique').fillColor('#64748b').text('Passport and Visa Issues Intelligence Dashboard', { align: 'center' });
    doc.moveDown(1.5);

    // Meta details
    doc.fontSize(9).font('Helvetica').fillColor('#334155');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'left' });
    doc.text(`Total Records Extracted: ${posts.length}`, { align: 'left' });
    doc.text(`Filters applied: Platform=${filters.platform || 'All'}, Category=${filters.category || 'All'}, Sentiment=${filters.sentiment || 'All'}`, { align: 'left' });
    doc.moveDown(1.5);

    // Horizontal Rule
    doc.moveTo(50, doc.y).lineTo(560, doc.y).strokeColor('#cbd5e1').lineWidth(1.5).stroke();
    doc.moveDown(2);

    if (posts.length === 0) {
      doc.fontSize(12).fillColor('#64748b').text('No posts match the specified filter criteria.', { align: 'center' });
      doc.end();
      return;
    }

    // List Posts
    posts.forEach((post, index) => {
      // Add a page if layout exceeds margins
      if (doc.y > 650) {
        doc.addPage();
      }

      // Card Header
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b')
        .text(`${index + 1}. [${post.platform.toUpperCase()}] ${post.author} (${post.handle})`);
      
      doc.fontSize(8.5).font('Helvetica').fillColor('#475569')
        .text(`Date: ${new Date(post.created_at).toLocaleString()}  |  Engagement Score: ${post.engagement_score}  |  Category: ${post.category || 'N/A'}`);
      doc.moveDown(0.4);

      // AI Summary
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0284c7').text('AI Summary: ', { continued: true })
         .font('Helvetica-Oblique').fillColor('#334155').text(post.summary || 'No summary generated.');
      doc.moveDown(0.4);

      // Main Text
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569').text('Content: ', { continued: true })
         .font('Helvetica').fillColor('#1e293b').text(
           post.translated_content 
             ? `[Translated] ${post.translated_content.substring(0, 300)}${post.translated_content.length > 300 ? '...' : ''}`
             : post.content.substring(0, 300) + (post.content.length > 300 ? '...' : '')
         );

      doc.moveDown(1.5);
      
      // Divider line between items
      doc.moveTo(50, doc.y).lineTo(560, doc.y).strokeColor('#f1f5f9').lineWidth(1).stroke();
      doc.moveDown(1.5);
    });

    // Page Numbers Helper
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#94a3b8').text(
        `Page ${i + 1} of ${range.count}`, 
        50, 
        750, 
        { align: 'center', width: 512 }
      );
    }

    doc.end();
  }
}
