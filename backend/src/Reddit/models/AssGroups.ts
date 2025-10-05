import mongoose from "mongoose";

const grpSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Group name must be at least 3 characters']
    },
    isPrivate: {
        type: Boolean,
        required: true,
        default: false
    },
    password: {
        type: String,
        default: null,
        validate: {
            validator: function(v: string) {
                // 'this' refers to the document being validated
                const doc = this as any;
                return !doc.isPrivate || (doc.isPrivate && v && v.length > 0);
            },
            message: 'Private groups must have a password'
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin' // Assuming you have an Admin model
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        // NOTE: Changed ref from 'Admin' to 'RedditUser' to allow users to join the group
        ref: 'RedditUser', 
        default: []
    },
    files: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'AdminFile',
        default: []
    }
},{
    timestamps:true
});

const AdminGroup = mongoose.model('AdminGroup', grpSchema);
export default AdminGroup;
