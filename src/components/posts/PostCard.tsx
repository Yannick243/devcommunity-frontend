import BookmarkAddSharpIcon from "@mui/icons-material/BookmarkAddSharp";
import FavoriteSharpIcon from "@mui/icons-material/FavoriteSharp";
import LightbulbSharpIcon from "@mui/icons-material/LightbulbSharp";
import ThumbUpSharpIcon from "@mui/icons-material/ThumbUpSharp";
import VolunteerActivismSharpIcon from "@mui/icons-material/VolunteerActivismSharp";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Tooltip from "@mui/material/Tooltip";
import CommentIcon from "@mui/icons-material/Comment";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import "dayjs/locale/fr";
import { FILES_BASE_URL } from "config/url";
import useStore from "@/hooks/useStore";
import React from "react";
import { patchRequest, postRequest } from "@/lib/api";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";

const PostCard: React.FC<{ data: Post }> = ({ data }) => {
  const user = useStore((state) => state.session?.user);
  const { setPosts, posts } = useStore((state) => state);
  const { push } = useRouter();
  const [userReaction, setUserReaction] = React.useState<ArticleReactionType | undefined>();

  const handleViewPost = () => {
    push(`/articles/${data?.slug}`);
  };

  const onReact = async (type: string) => {
    const post = await patchRequest({ endpoint: `/posts/${data?.id}/reactions/${type}/${user?.id}/article` });
    // update posts
    const updatedPosts = posts.map((el) => {
      if (el.id === post.data?.id) {
        return post.data;
      }
      return el;
    });

    setPosts(updatedPosts as Post[]);
  };

  // on add to bookmarks
  const onAddToBookmarks = async () => {
    const post = await patchRequest({ endpoint: `/posts/${data?.id}/bookmarks/${user?.id}` });
    // update posts
    const updatedPosts = posts.map((el) => {
      if (el.id === post.data?.id) {
        return post.data;
      }
      return el;
    });

    setPosts(updatedPosts as Post[]);
  };

  React.useEffect(() => {
    if (user) {
      const reaction = data?.article?.reactions?.find((reaction) => {
        return reaction?.user?.id === user?.id;
      });
      if (reaction) {
        setUserReaction(reaction.type);
      } else {
        setUserReaction(undefined);
      }
    }
  }, [data?.article?.reactions, user]);

  const Like = () => (
    <Tooltip title="I LIKE" placement="bottom" arrow>
      <IconButton onClick={() => onReact("LIKE")} disabled={!user?.id}>
        <ThumbUpSharpIcon color="info" fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const Useful = () => (
    <Tooltip title="USEFUL" placement="bottom" arrow>
      <IconButton onClick={() => onReact("USEFUL")} disabled={!user?.id}>
        <LightbulbSharpIcon color="warning" fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const Love = () => (
    <Tooltip title="I LOVE" placement="bottom" arrow>
      <IconButton onClick={() => onReact("LOVE")} disabled={!user?.id}>
        <FavoriteSharpIcon color="error" fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Grid container>
      <Grid item xs={2} md={1.2}>
        <Avatar alt={`${data?.author?.firstName} ${data?.author?.lastName}`} src={data?.author?.avatar?.url}>
          {data?.author?.firstName.charAt(0)}
        </Avatar>
      </Grid>
      <Grid item xs={10} md={10.8}>
        <Stack direction="row" spacing={1}>
          <Typography variant="caption" color="text.primary" gutterBottom fontWeight={700}>
            {data?.author?.firstName} {data?.author?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={700}>
            -
          </Typography>
          <Typography variant="caption" gutterBottom color="text.secondary">
            {dayjs(data?.publishedOn).fromNow()}
          </Typography>
        </Stack>
        <Typography
          gutterBottom
          fontWeight={700}
          color="text.primary"
          onClick={handleViewPost}
          sx={{
            display: "-webkit-box!important",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipse",
            whiteSpace: "normal",
            "&:hover": {
              color: "primary.main",
            },
            cursor: "pointer",
          }}
        >
          {data?.title}
        </Typography>
        <Typography
          gutterBottom
          color="text.secondary"
          fontSize={14}
          sx={{
            display: "-webkit-box!important",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipse",
            whiteSpace: "normal",
          }}
          component="div"
          dangerouslySetInnerHTML={{
            __html: data?.content,
          }}
        />
        {data?.article.image && (
          <Stack
            sx={{
              width: 1,
              height: { xs: 180, md: 240 },
              position: "relative",
              borderRadius: 2,
              cursor: "pointer",
              overflow: "hidden",
              my: 2,
            }}
            onClick={handleViewPost}
          >
            <Image src={FILES_BASE_URL + data?.article?.image?.url} alt="Post" layout="fill" objectFit="cover" />
          </Stack>
        )}
        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 1 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 52,
              transition: "all 0.5s ease",
            }}
          >
            {!userReaction ? (
              <>
                <Like />
                <Love />
                <Useful />
              </>
            ) : (
              <>
                {userReaction === "LIKE" && <Like />}
                {userReaction === "LOVE" && <Love />}
                {userReaction === "USEFUL" && <Useful />}
              </>
            )}
            <Tooltip title="See all reactions" placement="bottom" arrow>
              <IconButton>
                <Typography variant="caption" color="text.primary" fontWeight={700}>
                  {data.article?.reactions?.length}
                </Typography>
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton>
                <CommentIcon />
              </IconButton>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {data?.comments?.length || 0}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 52 }}
            >
              <Tooltip title="Save post" placement="bottom" arrow>
                <IconButton onClick={onAddToBookmarks}>
                  {data?.bookmarks?.find((el) => el.userId === user?.id) ? (
                    <BookmarkRemoveIcon color="secondary" fontSize="small" />
                  ) : (
                    <BookmarkAddSharpIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default PostCard;
