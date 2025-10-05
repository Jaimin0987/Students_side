import mongoose from "mongoose";

const adminfileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminGroup',
        required: true
    },
},{
    timestamps: true
});

const AdminFile = mongoose.model('AdminFile', adminfileSchema);
export default AdminFile;