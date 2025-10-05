import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminGroup',
        required: true
    },
    submissions: [{
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RedditUser'
        },
        fileUrl: {
            type: String
        },
        fileName: {
            type: String
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }]
},{
    timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
