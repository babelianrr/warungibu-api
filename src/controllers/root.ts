/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, Router } from 'express';
import { uploadHandler, setPrefixPath } from 'src/controllers/middlewares/handle-upload';

export class RootController {
    private router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/', RootController.index);
        // this.router.post('/multer', setPrefixPath('oultet_docs'), uploadHandler.single('photo'), RootController.multer);
    }

    getRouter() {
        return this.router;
    }

    /**
     * GET /
     * Home
     */
    static index(_: Request, res: Response) {
        return res.status(200).json({ message: 'You have successfully started the application!' });
    }

    // static multer(req: Request, res: Response) {
    //     return res.status(200).json({
    //         message: 'Multer Setup',
    //         file: req.file,
    //         body: req.body
    //     });
    // }
}
