package com.akademi.service;

import com.akademi.dto.request.CommentRequest;
import com.akademi.dto.response.CommentResponse;
import com.akademi.exception.ResourceNotFoundException;
import com.akademi.model.Comment;
import com.akademi.model.Incident;
import com.akademi.model.User;
import com.akademi.repository.CommentRepository;
import com.akademi.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final IncidentRepository incidentRepository;

    public CommentResponse addComment(Long incidentId, CommentRequest request, User author) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));

        // Student can only comment on their own incidents
        boolean isAdmin = author.getRole().name().equals("ADMIN");
        if (!isAdmin && !incident.getReportedBy().getId().equals(author.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only comment on your own incidents");
        }

        Comment comment = Comment.builder()
                .incident(incident)
                .user(author)
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);
        return toResponse(comment, author.getId());
    }

    public List<CommentResponse> getComments(Long incidentId, User requestingUser) {
        return commentRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId)
                .stream()
                .map(c -> toResponse(c, requestingUser.getId()))
                .toList();
    }

    public CommentResponse editComment(Long commentId, CommentRequest request, User requestingUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        // Only the author can edit their own comment
        if (!comment.getUser().getId().equals(requestingUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);
        return toResponse(comment, requestingUser.getId());
    }

    public void deleteComment(Long commentId, User requestingUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        boolean isAdmin = requestingUser.getRole().name().equals("ADMIN");
        boolean isOwner = comment.getUser().getId().equals(requestingUser.getId());

        // Admin can delete any comment, others can only delete their own
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment, Long requestingUserId) {
        return CommentResponse.builder()
                .id(comment.getId())
                .incidentId(comment.getIncident().getId())
                .content(comment.getContent())
                .authorId(comment.getUser().getId())
                .authorName(comment.getUser().getName())
                .authorRole(comment.getUser().getRole().name())
                .createdAt(comment.getCreatedAt())
                .isOwner(comment.getUser().getId().equals(requestingUserId))
                .build();
    }
}