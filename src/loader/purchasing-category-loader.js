import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";

const resource = 'categories';

module.exports = function (keyword, filter) {

    var config = Container.instance.get(Config);
    var endpoint = config.getEndpoint("master");
    
    return endpoint.find(resource, { keyword: keyword, filter: JSON.stringify(filter)})
        .then(results => {
            return results.data.map(category => {
                category.toString = function () {
                    return [this.code, this.name]
                        .filter((item, index) => {
                            return item && item.toString().trim().length > 0;
                        }).join(" - ");
                }
                return category;
            });
        });    
}