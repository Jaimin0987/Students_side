import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AdminGroup from "../models/AssGroups";
import AdminFile from "../models/File";
import Assignment from "../models/Assignments";
import RedditUser from '../models/RedditUser';
import { asyncHandler } from '../utils/asyncHander';
import { sendMessage } from '../utils/sendMessage';
import cloudinary from '../utils/coudinary';
import fs from "fs";
/**
 * @route   POST /api/groups/:groupId/join
 * @desc    Allows a RedditUser to join an AdminGroup
 * @access  Private (requires authenticated RedditUser)
 */
export const joinAdminGroup = asyncHandler(async (req: any, res: Response) => {
    const { groupId } = req.params;
    const { _id: userId } = req.user; // Assuming userId is available from auth middleware via req.user


    const group = await AdminGroup.findById(groupId);
    if (!group) {
        return sendMessage(res, 404, false, { info: 'Group not found.' });
    }

    const user = await RedditUser.findById(userId);
    if (!user) {
        return sendMessage(res, 404, false, { info: 'RedditUser not found.' });
    }

    // Check if the user is already a member
    if (group.members.some(memberId => memberId.equals(userId))) {
        return sendMessage(res, 409, false, { info: 'User is already a member of this group.' });
    }

    group.members.push(user._id);
    await group.save();

    return sendMessage(res, 200, true, { data: group, info: 'Successfully joined the group.' });
});

/**
 * @route   GET /api/groups/:groupId/files
 * @desc    Get all files in a group for a member
 * @access  Private (group members only)
 */
export const getGroupFiles = asyncHandler(async (req: any, res: Response) => {
    const { groupId } = req.params;
    const { _id: userId } = req.user;


    const group = await AdminGroup.findById(groupId);
    if (!group) {
        return sendMessage(res, 404, false, { info: 'Group not found.' });
    }

    // Authorize: Check if the user is a member of the group
    if (!group.members.some(memberId => memberId.equals(userId))) {
        return sendMessage(res, 403, false, { info: 'Access denied. You are not a member of this group.' });
    }

    const files = await AdminFile.find({ group: groupId });
    return sendMessage(res, 200, true, { data: files, info: 'Files retrieved successfully.' });
});

/**
 * @route   GET /api/groups/:groupId/assignments
 * @desc    Get all assignments in a group for a member
 * @access  Private (group members only)
 */
export const getGroupAssignments = asyncHandler(async (req: any, res: Response) => {
    const { groupId } = req.params;
    const { _id: userId } = req.user;


    const group = await AdminGroup.findById(groupId);
    if (!group) {
        return sendMessage(res, 404, false, { info: 'Group not found.' });
    }

    // Authorize: Check if the user is a member of the group
    if (!group.members.some(memberId => memberId.equals(userId))) {
        return sendMessage(res, 403, false, { info: 'Access denied. You are not a member of this group.' });
    }

    const assignments = await Assignment.find({ group: groupId }).populate('submissions.submittedBy', 'name');
    return sendMessage(res, 200, true, { data: assignments, info: 'Assignments retrieved successfully.' });
});

/**
 * @route   POST /api/assignments/:assignmentId/submit
 * @desc    Submit a file for an assignment
 * @access  Private (group members only)
 */
export const submitAssignment = asyncHandler(async (req: any, res: Response) => {
    const { assignmentId } = req.params;
    const { _id: userId } = req.user;

    let imgUrl = null;
        if (req.file) {
            try {
                const filePath = req.file.path;
                const result = await cloudinary.uploader.upload(filePath, {
                    resource_type: "auto",
                    folder: "temp"
                });
                imgUrl = result.secure_url;
                fs.unlinkSync(filePath);
            } catch (error) {
                console.error('Error uploading to cloudinary:', error);
                // Continue without image if upload fails
            }
        }
        
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return sendMessage(res, 404, false, { info: 'Assignment not found.' });
    }

    const group = await AdminGroup.findById(assignment.group);
    if (!group) {
        return sendMessage(res, 404, false, { info: 'The group for this assignment no longer exists.' });
    }
    
    // Authorize: Check if the user is a member of the group
    if (!group.members.some(memberId => memberId.equals(userId))) {
        return sendMessage(res, 403, false, { info: 'Access denied. You cannot submit to an assignment in a group you are not a member of.' });
    }

    const existingSubmission = assignment.submissions.find(sub => sub.submittedBy.equals(userId));

    if (existingSubmission) {
        // Update existing submission
        existingSubmission.fileUrl = imgUrl;
        existingSubmission.fileName = req.file.filename;
        existingSubmission.submittedAt = new Date();
    } else {
        // Add new submission
        assignment.submissions.push({
            submittedBy: new mongoose.Types.ObjectId(userId),
            fileUrl:imgUrl,
            fileName:req.file.filename,
            submittedAt: new Date(),
        } as any);
    }

    await assignment.save();
    return sendMessage(res, 200, true, { data: assignment, info: 'Assignment submitted successfully.' });
});