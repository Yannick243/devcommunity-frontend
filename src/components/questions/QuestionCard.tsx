import useStore from "@/hooks/useStore";
import { patchRequest } from "@/lib/api";
import BookmarkAddSharpIcon from "@mui/icons-material/BookmarkAddSharp";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import TagIcon from "@mui/icons-material/Tag";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpSharpIcon from "@mui/icons-material/ThumbUpSharp";
import { Chip } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
import hljs from "highlight.js";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
dayjs.extend(relativeTime);
import Share from "@/components/common/Share";

import { CallToActionSkeleton } from "@/components/middle/Skeleton";
import { FILES_BASE_URL } from "config/url";
import ShowQuestionReactions from "./ShowQuestionReactions";
const CallToAction = dynamic(import("@/components/middle/CallToAction"), {
  ssr: false,
  loading: () => <CallToActionSkeleton />,
});

const QuestionCard: React.FC<{ data: Post }> = ({ data }) => {
  const user = useStore((state) => state.session?.user);
  const { push, locale } = useRouter();
  const { setPosts, posts } = useStore((state) => state);
  const [userReaction, setUserReaction] = React.useState<QuestionReactionType | undefined>();
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openReaction, setOpenReaction] = React.useState(false);

  locale === "fr" ? dayjs.locale("fr") : dayjs.locale("en");

  const handleCloseLogin = () => {
    setOpenLogin(false);
  };

  const handleCloseReaction = () => {
    setOpenReaction(false);
  };

  const handleViewQuestion = () => {
    push(`/posts/${data.slug}`);
  };

  const onReact = async (type: QuestionReactionType) => {
    if (user?.id) {
      const post = await patchRequest({ endpoint: `/posts/${data?.id}/reactions/${type}/${user?.id}/question` });
      // update posts
      const updatedPosts = posts.map((el) => {
        if (el.id === post.data?.id) {
          return post.data;
        }
        return el;
      });

      return setPosts(updatedPosts as Post[]);
    }
    setOpenLogin(true);
  };

  // on add to bookmarks
  const onAddToBookmarks = async () => {
    if (user?.id) {
      const post = await patchRequest({ endpoint: `/posts/${data?.id}/bookmarks/${user?.id}` });
      // update posts
      const updatedPosts = posts.map((el) => {
        if (el.id === post.data?.id) {
          return post.data;
        }
        return el;
      });

      return setPosts(updatedPosts as Post[]);
    }
    setOpenLogin(true);
  };

  React.useEffect(() => {
    document.querySelectorAll("pre").forEach((el) => {
      hljs.highlightElement(el);
    });
  }, []);

  React.useEffect(() => {
    if (user) {
      const reaction = data?.question?.reactions?.find((reaction) => {
        return reaction?.user?.id === user?.id;
      });
      if (reaction) {
        setUserReaction(reaction.type);
      } else {
        setUserReaction(undefined);
      }
    }
  }, [data?.question?.reactions, user]);

  return (
    <Stack>
      <Dialog
        open={openLogin}
        onClose={handleCloseLogin}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <CallToAction />
      </Dialog>

      <Dialog
        open={openReaction}
        onClose={handleCloseReaction}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <ShowQuestionReactions reactions={data?.question?.reactions} />
      </Dialog>
      <Grid container>
        <Grid item xs={2} sm={1} md={2} lg={1.2}>
          <IconButton onClick={() => push(`/profile/@${data?.author?.email.split("@")[0]}`)}>
            <Avatar
              sx={{ bgcolor: "primary.main", color: "white" }}
              alt={`${data?.author?.firstName} ${data?.author?.lastName}`}
              src={FILES_BASE_URL + data?.author?.profile?.avatar?.url}
            >
              {data?.author?.firstName.charAt(0)}
            </Avatar>
          </IconButton>
        </Grid>
        <Grid item xs={10} sm={11} md={10} lg={10.8}>
          <Stack direction="row" spacing={1}>
            <Typography
              onClick={() => push(`/profile/@${data?.author?.email.split("@")[0]}`)}
              sx={{
                "&:hover": {
                  color: "primary.main",
                },
                cursor: "pointer",
              }}
              variant="caption"
              color="text.primary"
              gutterBottom
              fontWeight={700}
            >
              {data?.author?.firstName} {data?.author?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={700}>
              -
            </Typography>
            <Typography variant="caption" gutterBottom color="text.secondary">
              {dayjs(data?.createdAt).fromNow()}
            </Typography>
          </Stack>
          <Typography
            gutterBottom
            fontWeight={700}
            color="text.primary"
            onClick={handleViewQuestion}
            sx={{
              "&:hover": {
                color: "primary.main",
              },
              cursor: "pointer",
              display: "-webkit-box!important",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipse",
              whiteSpace: "normal",
            }}
          >
            {data?.title}
          </Typography>
        </Grid>
      </Grid>
      <Typography
        color="text.secondary"
        component="div"
        className="content"
        gutterBottom
        sx={{
          display: "-webkit-box!important",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipse",
          whiteSpace: "normal",
        }}
        dangerouslySetInnerHTML={{
          __html: data?.content.length > 120 ? `${data?.content.substring(0, 140)}...` : data?.content,
        }}
      />

      <Grid container spacing={1} sx={{ pb: 1 }} direction="row">
        {data?.tags?.map((el) => (
          <Grid item xs="auto" key={el.tag.id}>
            <Chip size="small" icon={<TagIcon fontSize="small" />} label={el.tag.name} />
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, px: 1, borderRadius: 52 }}
          >
            <Tooltip title={locale === "en" ? "Endorse" : "Approuver"} placement="bottom" arrow>
              <IconButton onClick={() => onReact("LIKE")}>
                <ThumbUpSharpIcon color={userReaction === "LIKE" ? "info" : "inherit"} fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={locale === "en" ? "See all reactions" : "Voir toutes les réactions"}
              placement="bottom"
              arrow
            >
              <IconButton onClick={() => setOpenReaction(true)}>
                <Typography variant="caption" color="text.primary" fontWeight={700}>
                  {data?.question?.reactions?.filter((el) => el.type === "LIKE").length}
                </Typography>
              </IconButton>
            </Tooltip>

            <Tooltip title={locale === "en" ? "Disapprove" : "Désapprouver"} placement="bottom" arrow>
              <IconButton onClick={() => onReact("DISLIKE")}>
                <ThumbDownOffAltIcon color={userReaction === "DISLIKE" ? "error" : "inherit"} fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={locale === "en" ? "See all reactions" : "Voir toutes les réactions"}
              placement="bottom"
              arrow
            >
              <IconButton onClick={() => setOpenReaction(true)}>
                <Typography variant="caption" color="text.primary" fontWeight={700}>
                  {data?.question?.reactions?.filter((el) => el.type === "DISLIKE").length}
                </Typography>
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Link href={`/posts/${data?.slug}/#comments`} passHref>
              <IconButton>
                <QuestionAnswerIcon fontSize="small" />
              </IconButton>
            </Link>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {data?.comments?.length || 0}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 52 }}
          >
            <Tooltip title={locale === "en" ? "Add to bookmarks" : "Ajouter aux favoris"} placement="bottom" arrow>
              <IconButton onClick={onAddToBookmarks}>
                {data?.bookmarks?.find((el) => el.userId === user?.id) ? (
                  <BookmarkRemoveIcon color="secondary" fontSize="small" />
                ) : (
                  <BookmarkAddSharpIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
          <Share data={data} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default QuestionCard;
