export class Index {
    configureRouter(config, router) {
        config.map([
            { route: ['', 'list'], moduleId: './list', name: 'list', nav: true, title: 'List' },
            { route: 'view/:id', moduleId: './view', name: 'view', nav: false, title: 'View: Alasan Design Tracking' },
            { route: 'edit/:id', moduleId: './edit', name: 'edit', nav: false, title: 'Edit: Alasan Design Tracking' },
            { route: 'create', moduleId: './create', name: 'create', nav: false, title: 'Create: Alasan Design Tracking' }
        ]);

        this.router = router;
    }
}
