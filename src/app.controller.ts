import {
  Controller,
  Get,
  Render,
  Query,
  Redirect,
  Req,
  Post,
  Body,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AppService } from './app.service';
import axios, { AxiosResponse } from 'axios';
import { Octokit } from 'octokit';
import * as keys from './keys.json';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * The root route for this server.
   * @render index.hbs
   */
  @Get()
  @Render('index')
  render(): any {
    return {};
  }

  /**
   * @redirect to Github Login page.
   */
  @Get('login')
  @Redirect(
    `https://github.com/login/oauth/authorize?scope=public_repo,user,delete_repo&client_id=${keys.CLIENT_ID}`,
    301,
  )
  login(): any {
    return {};
  }

  /**
   * A callback route for the Github auth API to redirect to.
   */
  @Get('callback')
  async authCallback(@Query() query: any, @Res() res: any): Promise<void> {
    const code: string = query.code;
    const response: AxiosResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: keys.CLIENT_ID,
        client_secret: keys.CLIENT_SECRET,
        code,
      },
    );
    const params: URLSearchParams = new URLSearchParams(response.data);
    const octokit: Octokit = new Octokit({ auth: params.get('access_token') });
    const {
      data: { login },
    }: { data: { login: string } } =
      await octokit.rest.users.getAuthenticated();
    await this.appService.createUser(login, params.get('access_token'));
    res.redirect(`/home?username=${login}`);
  }

  /**
   * @render home.hbs after auth with Github API is successful
   * This page contains options for creating and deleting a repository.
   */
  @Get('home')
  @Render('home')
  renderHome(@Query() query: any, @Res() res: any): any {
    if (!query.username) {
      res.redirect('/');
      return {};
    }
    return { user: query.username };
  }

  /**
   * A fallback route after a repository is successfully created.
   */
  @Post('create_repo')
  @UseInterceptors(FileInterceptor('file'))
  @Render('repo_success')
  async createRepo(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: any,
  ): Promise<any> {
    if (!body.username || !body.repoName) {
      res.redirect('/home');
      return {};
    }
    const accessToken: string = await this.appService.getAccessToken(
      body.username,
    );
    const octokit: Octokit = new Octokit({ auth: accessToken });
    try {
      await octokit.request('POST /user/repos', {
        name: body.repoName,
      });
      if (file) {
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: body.username,
          repo: body.repoName,
          path: file.originalname,
          message: 'Commit using Github API',
          content: file.buffer.toString('base64'),
        });
      }
    } catch (e: any) {
      res.redirect(`/home?username=${body.username}`);
      return {};
    }
    return { repoName: body.repoName, username: body.username };
  }

  /**
   * A fallback route after a repository is successfully deleted.
   */
  @Post('delete_repo')
  @Render('repo_delete')
  async deleteRepo(@Req() req: Request, @Res() res: any): Promise<any> {
    if (!req.body.username || !req.body.repoName) {
      res.redirect('/home');
      return {};
    }
    const accessToken: string = await this.appService.getAccessToken(
      req.body.username,
    );
    const octokit: Octokit = new Octokit({ auth: accessToken });
    try {
      await octokit.request(
        `DELETE /repos/${req.body.username}/${req.body.repoName}`,
      );
    } catch (e: any) {
      res.redirect(`/home?username=${req.body.username}`);
      return {};
    }
    return { repoName: req.body.repoName, username: req.body.username };
  }
}
