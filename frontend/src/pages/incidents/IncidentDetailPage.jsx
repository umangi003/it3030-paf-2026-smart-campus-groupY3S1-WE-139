import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { incidentApi } from '../../api/incidentApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import SLABadge from '../../components/common/SLABadge'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED', 'REJECTED']

export default function IncidentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingContent, setEditingContent] = useState('')

  const fetchComments = async () => {
    try {
      const res = await incidentApi.getComments(id)
      setComments(res.data.data || [])
    } catch { }
  }

  useEffect(() => {
    incidentApi.getById(id)
      .then(r => setIncident(r.data.data))
      .catch(() => toast.error('Incident not found'))
      .finally(() => setLoading(false))
    fetchComments()
  }, [id])

  const handleStatusChange = async (status) => {
    if (status === 'REJECTED') {
      setShowRejectModal(true)
      return
    }
    try {
      const res = await incidentApi.updateStatus(id, status)
      setIncident(res.data.data)
      toast.success('Status updated')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setRejecting(true)
    try {
      const res = await incidentApi.reject(id, rejectReason.trim())
      setIncident(res.data.data)
      toast.success('Incident rejected')
      setShowRejectModal(false)
      setRejectReason('')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setRejecting(false) }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSubmittingComment(true)
    try {
      await incidentApi.addComment(id, newComment.trim())
      setNewComment('')
      fetchComments()
      toast.success('Comment added')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSubmittingComment(false) }
  }

  const handleEditComment = async (commentId) => {
    if (!editingContent.trim()) return
    try {
      await incidentApi.editComment(commentId, editingContent.trim())
      setEditingCommentId(null)
      setEditingContent('')
      fetchComments()
      toast.success('Comment updated')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await incidentApi.deleteComment(commentId)
      fetchComments()
      toast.success('Comment deleted')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
  if (!incident) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Incident not found.</p>

  return (
    <div style={{ maxWidth: 680 }}>
      <button onClick={() => navigate('/incidents')} style={{
        background: 'none', border: 'none', color: 'var(--gray-400)',
        fontSize: 14, cursor: 'pointer', marginBottom: 20
      }}>← Back to Incidents</button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Main card */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>{incident.title}</h1>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={incident.status} />
                  {incident.sla && <SLABadge sla={incident.sla} />}
                </div>
              </div>
              {isAdmin() && (
                <select value={incident.status}
                  onChange={e => handleStatusChange(e.target.value)}
                  style={{
                    padding: '7px 12px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)', fontSize: 13,
                    fontFamily: 'var(--font-sans)', cursor: 'pointer', outline: 'none'
                  }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              )}
            </div>
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Rejection reason banner — visible to everyone */}
              {incident.status === 'REJECTED' && incident.rejectionReason && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)', padding: '12px 16px',
                }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rejection Reason</p>
                  <p style={{ fontSize: 14, color: '#7f1d1d' }}>{incident.rejectionReason}</p>
                </div>
              )}

              <div>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</p>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{incident.description}</p>
              </div>

              {/* Image Attachments */}
              {incident.imageUrls?.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Attachments</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {incident.imageUrls.map((url, i) => (
                      <a key={i} href={`http://localhost:8081${url}`} target="_blank" rel="noreferrer">
                        <img
                          src={`http://localhost:8081${url}`}
                          alt={`attachment-${i}`}
                          style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', cursor: 'pointer' }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['Location', incident.location],
                  ['Reported by', incident.reportedByName],
                  ['Assigned to', incident.assignedToName || 'Unassigned'],
                  ['Reported', formatDateTime(incident.createdAt)],
                  ['Responded', formatDateTime(incident.respondedAt)],
                  ['Resolved', formatDateTime(incident.resolvedAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                    <p style={{ fontSize: 14 }}>{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Comments</h2>
          </div>

          {/* Comment list */}
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center', padding: '16px 0' }}>
                No comments yet.
              </p>
            ) : comments.map(c => (
              <div key={c.id} style={{
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: c.isOwner ? '#f0fdf4' : 'var(--gray-50)',
                border: `1px solid ${c.isOwner ? '#bbf7d0' : 'var(--gray-200)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-deepest)' }}>{c.authorName}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
                      background: c.authorRole === 'ADMIN' ? '#dbeafe' : '#f0fdf4',
                      color: c.authorRole === 'ADMIN' ? '#1d4ed8' : '#16a34a',
                      fontFamily: 'var(--font-mono)', textTransform: 'uppercase'
                    }}>{c.authorRole}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                      {formatDateTime(c.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {c.isOwner && (
                      <button onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content) }} style={{
                        padding: '3px 8px', fontSize: 11, borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--gray-200)', background: 'transparent',
                        cursor: 'pointer', color: 'var(--gray-600)'
                      }}>Edit</button>
                    )}
                    {(c.isOwner || isAdmin()) && (
                      <button onClick={() => handleDeleteComment(c.id)} style={{
                        padding: '3px 8px', fontSize: 11, borderRadius: 'var(--radius-sm)',
                        border: 'none', background: '#fee2e2',
                        cursor: 'pointer', color: '#dc2626'
                      }}>Delete</button>
                    )}
                  </div>
                </div>

                {/* Edit mode */}
                {editingCommentId === c.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--gray-200)', fontSize: 13,
                        fontFamily: 'var(--font-sans)', resize: 'vertical', minHeight: 70,
                        outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setEditingCommentId(null); setEditingContent('') }} style={{
                        padding: '5px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--gray-200)', background: '#fff', cursor: 'pointer'
                      }}>Cancel</button>
                      <button onClick={() => handleEditComment(c.id)} style={{
                        padding: '5px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)',
                        border: 'none', background: 'var(--green-deepest)', color: '#fff', cursor: 'pointer'
                      }}>Save</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--gray-700)' }}>{c.content}</p>
                )}
              </div>
            ))}
          </div>

          {/* Add comment input */}
          <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)', fontSize: 13,
                fontFamily: 'var(--font-sans)', resize: 'vertical', minHeight: 80,
                outline: 'none', boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleAddComment}
                disabled={submittingComment || !newComment.trim()}
                style={{
                  padding: '8px 18px', borderRadius: 'var(--radius-md)',
                  border: 'none', background: 'var(--green-deepest)', color: '#fff',
                  fontSize: 13, cursor: submittingComment ? 'not-allowed' : 'pointer',
                  opacity: submittingComment || !newComment.trim() ? 0.6 : 1,
                  fontFamily: 'var(--font-sans)'
                }}>
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div onClick={() => setShowRejectModal(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: 440, padding: 24
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Reject Incident</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>
              Please provide a reason. This will be visible to the student.
            </p>
            <textarea
              autoFocus
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate report, insufficient information..."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid var(--gray-200)', fontSize: 14,
                fontFamily: 'var(--font-sans)', resize: 'vertical',
                minHeight: 100, outline: 'none', boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setShowRejectModal(false); setRejectReason('') }} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid var(--gray-200)',
                background: '#fff', fontSize: 13, cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleReject} disabled={rejecting} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: '#dc2626', color: '#fff', fontSize: 13,
                cursor: rejecting ? 'not-allowed' : 'pointer', opacity: rejecting ? 0.7 : 1
              }}>{rejecting ? 'Rejecting...' : 'Confirm Reject'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}