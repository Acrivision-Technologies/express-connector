import { SpatialCategory, SubCategory } from "@itwin/core-backend";
import { Id64String } from "@itwin/core-bentley";
import { ColorDefProps, SubCategoryAppearance } from "@itwin/core-common";
import { Categories, CategoryColor } from "../Categories";
import { queryDefinitionModel } from "./ConnectorGroupModelService";


export class CategoryDefinitionModel {
    private synchronizer: any;
    private jobSubject: any;
    constructor(synchronizer: any, jobSubject: any) {
        this.synchronizer = synchronizer;
        this.jobSubject = jobSubject;
    }

    insertCategories() {

        const panelCategoryId = this.insertCategory(Categories.Panels, CategoryColor.Panels);
        const mountCategoryId = this.insertCategory(Categories.Mounts, CategoryColor.Mounts);
        const attachmentsCategoryId = this.insertCategory(Categories.Attachments, CategoryColor.Attachment);
        const appurtenancesCategoryId = this.insertCategory(Categories.Appurtenances, CategoryColor.Appurtenance);
        const polesCategoryId = this.insertCategory(Categories.Poles, CategoryColor.Poles);
        // this.insertSubCategory(panelCategoryId, Categories.Legs, CategoryColor.Legs);
        // this.insertSubCategory(panelCategoryId, Categories.FaceBracing, CategoryColor.FaceBracing);
        // this.insertSubCategory(panelCategoryId, Categories.PlanBracing, CategoryColor.PlanBracing);

    }

    private insertCategory(name: string, colorDef: ColorDefProps): Id64String {
        const opts: SubCategoryAppearance.Props = {
            // color: colorDef,
        };
        console.log("inside the insertCategory");
        console.log(`category: ${name}`);
        console.log(`colorDef: ${colorDef}`);
        console.log('opts');
        console.log(opts);

        return SpatialCategory.insert(this.synchronizer.imodel, queryDefinitionModel(this.synchronizer, this.jobSubject)!, name, opts);
    }

    private insertSubCategory(categoryId: Id64String, name: string, colorDef: ColorDefProps) {
        const opts: SubCategoryAppearance.Props = {
            // color: colorDef,
        };

        console.log("inside the insertSubCategory");
        console.log(`category: ${name}`);
        console.log(`colorDef: ${colorDef}`);
        console.log('opts');
        console.log(opts);

        return SubCategory.insert(this.synchronizer.imodel, categoryId, name, opts);
    }
}